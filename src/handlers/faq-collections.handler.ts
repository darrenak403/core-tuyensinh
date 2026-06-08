import type { CollectionStatus, FaqCollectionExportRow } from "@app-types/faq";
import { FaqCollectionsService } from "@services/faq-collections.service";
import type { Context } from "hono";

const service = new FaqCollectionsService();

export const getFaqCollectionsHandler = async (c: Context) => {
  const limit = Number(c.req.query("limit")) || 50;
  const offset = Number(c.req.query("offset")) || 0;
  const year = c.req.query("admission_year") ? Number(c.req.query("admission_year")) : undefined;
  const filters = {
    status: c.req.query("status"),
    admission_year: year,
  };
  return c.json(await service.findAll(filters, limit, offset), 200);
};

export const getFaqCollectionHandler = async (c: Context) => {
  const col = await service.findById(c.req.param("id")!);
  if (!col) return c.json({ error: "NOT_FOUND", message: "FAQ collection not found" }, 404);
  return c.json({ data: col }, 200);
};

export const getFaqCollectionDetailHandler = async (c: Context) => {
  const col = await service.findDetailById(c.req.param("id")!);
  if (!col) return c.json({ error: "NOT_FOUND", message: "FAQ collection not found" }, 404);
  return c.json({ data: col }, 200);
};

export const exportFaqCollectionCsvHandler = async (c: Context) => {
  const id = c.req.param("id")!;
  const collection = await service.findById(id);
  const rows = await service.getExportRows(id);
  if (!collection || !rows) {
    return c.json({ error: "NOT_FOUND", message: "FAQ collection not found" }, 404);
  }

  const csv = toCsv([
    [
      "Record ID",
      "Chủ đề chính",
      "Chủ đề con",
      "Câu hỏi",
      "Question Aliases",
      "Các câu trả lời của câu hỏi đó (kèm campus)",
      "Năm",
      "Cơ sở",
      "Trạng thái duyệt câu hỏi",
      "Câu hỏi đã duyệt",
      "Trạng thái duyệt câu trả lời",
      "Câu trả lời đã duyệt",
    ],
    ...rows.map((row) => [
      row.record_id,
      row.main_topic,
      row.sub_topic,
      row.question,
      row.question_aliases.join("\n"),
      row.answer,
      String(row.admission_year),
      row.campus,
      row.question_status,
      row.question_status === "approved" ? "Có" : "Không",
      row.answer_status,
      row.answer_status === "approved" ? "Có" : "Không",
    ]),
  ]);

  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header("Content-Disposition", `attachment; filename="${buildCollectionFileName(collection.name, "csv")}"`);
  return c.body(`\uFEFF${csv}`, 200);
};

export const exportFaqCollectionExcelHandler = async (c: Context) => {
  const id = c.req.param("id")!;
  const collection = await service.findById(id);
  const rows = await service.getExportRows(id);
  if (!collection || !rows) {
    return c.json({ error: "NOT_FOUND", message: "FAQ collection not found" }, 404);
  }

  const excel = toExcelXml(collection.name, rows);

  c.header("Content-Type", "application/vnd.ms-excel; charset=utf-8");
  c.header("Content-Disposition", `attachment; filename="${buildCollectionFileName(collection.name, "xls")}"`);
  return c.body(excel, 200);
};

export const exportFaqCollectionMarkdownHandler = async (c: Context) => {
  const id = c.req.param("id")!;
  const collection = await service.findById(id);
  const rows = await service.getExportRows(id);
  if (!collection || !rows) {
    return c.json({ error: "NOT_FOUND", message: "FAQ collection not found" }, 404);
  }

  const markdown = rows.map(formatFaqRecordMarkdown).join("\n\n---\n\n");

  c.header("Content-Type", "text/markdown; charset=utf-8");
  c.header("Content-Disposition", `attachment; filename="${buildCollectionFileName(collection.name, "md")}"`);
  return c.body(markdown, 200);
};

export const createFaqCollectionHandler = async (c: Context) => {
  const data = await c.req.json();
  const col = await service.create(data);
  return c.json({ data: col }, 201);
};

export const updateFaqCollectionHandler = async (c: Context) => {
  const data = await c.req.json();
  const col = await service.update(c.req.param("id")!, data);
  return c.json({ data: col }, 200);
};

export const transitionFaqCollectionStatusHandler = async (c: Context) => {
  const { status } = await c.req.json();
  const user = c.get("user");
  const col = await service.transitionStatus(c.req.param("id")!, status as CollectionStatus, user?.id);
  return c.json({ data: col }, 200);
};

export const addFaqCollectionItemsHandler = async (c: Context) => {
  const { question_ids } = await c.req.json();
  const inserted = await service.addItems(c.req.param("id")!, question_ids ?? []);
  return c.json({ message: `Added ${inserted} question(s) to collection`, inserted }, 200);
};

export const addFaqCollectionSubTopicQuestionsHandler = async (c: Context) => {
  const { sub_topic_id } = await c.req.json();
  const result = await service.addApprovedQuestionsBySubTopic(c.req.param("id"), sub_topic_id);
  return c.json(
    {
      message: `Added ${result.inserted} approved question(s) from sub-topic to collection`,
      inserted: result.inserted,
      matched_count: result.matched_count,
    },
    200
  );
};

export const removeFaqCollectionItemHandler = async (c: Context) => {
  await service.removeItem(c.req.param("id")!, c.req.param("questionId")!);
  return c.json({ message: "Question removed from collection" }, 200);
};

export const copyFaqCollectionHandler = async (c: Context) => {
  const data = await c.req.json();
  const col = await service.copy(c.req.param("id")!, data);
  return c.json({ data: col }, 201);
};

export const deleteFaqCollectionHandler = async (c: Context) => {
  await service.delete(c.req.param("id")!);
  return c.json({ message: "FAQ collection deleted successfully" }, 200);
};

function toCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${cell.replace(/"/g, '""').replace(/\r?\n/g, "\n")}"`)
        .join(",")
    )
    .join("\n");
}

function toExcelXml(title: string, rows: FaqCollectionExportRow[]): string {
  const columns = [
    { name: "Record ID", width: 150 },
    { name: "Chủ đề chính", width: 140 },
    { name: "Chủ đề con", width: 140 },
    { name: "Câu hỏi", width: 300 },
    { name: "Question Aliases", width: 220 },
    { name: "Các câu trả lời của câu hỏi đó (kèm campus)", width: 420 },
    { name: "Năm", width: 70 },
    { name: "Cơ sở", width: 150 },
    { name: "Trạng thái duyệt câu hỏi", width: 140 },
    { name: "Câu hỏi đã duyệt", width: 110 },
    { name: "Trạng thái duyệt câu trả lời", width: 150 },
    { name: "Câu trả lời đã duyệt", width: 120 },
  ];

  const tableRows = rows
    .map((row) =>
      [
        row.record_id,
        row.main_topic,
        row.sub_topic,
        row.question,
        row.question_aliases.join("\n"),
        row.answer,
        String(row.admission_year),
        row.campus,
        row.question_status,
        row.question_status === "approved" ? "Có" : "Không",
        row.answer_status,
        row.answer_status === "approved" ? "Có" : "Không",
      ]
        .map((cell) => `<Cell ss:StyleID="Body"><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`)
        .join("")
    )
    .map((cells) => `<Row ss:AutoFitHeight="1">${cells}</Row>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Title">
   <Font ss:Bold="1" ss:Size="16" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1F4E78" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Subtitle">
   <Font ss:Italic="1" ss:Color="#666666"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
  </Style>
  <Style ss:ID="Body">
   <Alignment ss:Vertical="Top" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9E2F3"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9E2F3"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9E2F3"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9E2F3"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="FAQ Export">
  <Table>
   ${columns.map((column) => `<Column ss:Width="${column.width}"/>`).join("")}
   <Row ss:Height="28">
    <Cell ss:MergeAcross="${columns.length - 1}" ss:StyleID="Title">
     <Data ss:Type="String">${escapeXml(`FAQ Collection Export - ${title}`)}</Data>
    </Cell>
   </Row>
   <Row ss:Height="22">
    <Cell ss:MergeAcross="${columns.length - 1}" ss:StyleID="Subtitle">
     <Data ss:Type="String">${escapeXml(`Tổng số dòng: ${rows.length}`)}</Data>
    </Cell>
   </Row>
   <Row ss:Height="32">
    ${columns.map((column) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(column.name)}</Data></Cell>`).join("")}
   </Row>
   ${tableRows}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>3</SplitHorizontal>
   <TopRowBottomPane>3</TopRowBottomPane>
   <ActivePane>2</ActivePane>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildCollectionFileName(collectionName: string, extension: "csv" | "xls" | "md"): string {
  return `${slugifyFileName(collectionName)}.${extension}`;
}

function slugifyFileName(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "faq-collection";
}

function formatFaqRecordMarkdown(row: FaqCollectionExportRow): string {
  const aliases = row.question_aliases.length > 0 ? row.question_aliases.join("\n") : "";

  return [
    "FAQ Record",
    `Record ID: ${row.record_id}`,
    "",
    `Main Topic: ${row.main_topic}`,
    "",
    `Sub Topic: ${row.sub_topic}`,
    "",
    `Question: ${row.question}`,
    "",
    "Question Aliases:",
    "",
    aliases,
    "",
    `Answer: ${row.answer}`,
    "",
    "Metadata:",
    "",
    `admission_year: ${row.admission_year}`,
    `campus: ${row.campus}`,
    "status: active",
    "priority: 1",
  ].join("\n");
}
