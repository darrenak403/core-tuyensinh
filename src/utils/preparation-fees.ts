/**
 * Preparation Fees Utility Functions
 * Helper functions for calculating and formatting preparation fees
 */

import type { CampusPublic } from "@/types/campuses";

export interface PreparationFeeCalculation {
  orientation_cost: number;
  english_prep_cost: number;
  total_preparation_cost: number;
  english_levels_needed: number;
  campus_discount: number;
}

export interface FeeScenario {
  scenario_name: string;
  campus_code: string;
  has_ielts: boolean;
  english_levels_needed: number;
  calculation: PreparationFeeCalculation;
  description: string;
}

/**
 * Calculate total preparation cost for a student
 */
export function calculateTotalPreparationCost(
  campus: CampusPublic,
  englishLevelsNeeded = 0
): PreparationFeeCalculation {
  const preparationFees = campus.preparation_fees;

  if (!preparationFees) {
    return {
      orientation_cost: 0,
      english_prep_cost: 0,
      total_preparation_cost: 0,
      english_levels_needed: 0,
      campus_discount: campus.discount_percentage,
    };
  }

  const orientationCost = preparationFees.orientation.fee;
  const englishPrepCost =
    preparationFees.english_prep.fee * englishLevelsNeeded;
  const totalCost = orientationCost + englishPrepCost;

  return {
    orientation_cost: orientationCost,
    english_prep_cost: englishPrepCost,
    total_preparation_cost: totalCost,
    english_levels_needed: englishLevelsNeeded,
    campus_discount: campus.discount_percentage,
  };
}

/**
 * Get preparation fees by type
 */
export function getPreparationFeesByType(
  campus: CampusPublic,
  feeType: "orientation" | "english_prep"
) {
  return campus.preparation_fees?.[feeType] || null;
}

/**
 * Format preparation fees for API response
 */
export function formatPreparationFeesForAPI(campus: CampusPublic) {
  if (!campus.preparation_fees) {
    return null;
  }

  return {
    year: campus.preparation_fees.year,
    campus_discount: campus.discount_percentage,
    fees: {
      orientation: {
        ...campus.preparation_fees.orientation,
        formatted_fee: formatCurrency(campus.preparation_fees.orientation.fee),
      },
      english_prep: {
        ...campus.preparation_fees.english_prep,
        formatted_fee: formatCurrency(campus.preparation_fees.english_prep.fee),
      },
    },
  };
}

/**
 * Generate fee scenarios for different student types
 */
export function generateFeeScenarios(campus: CampusPublic): FeeScenario[] {
  const scenarios: FeeScenario[] = [];

  // Scenario 1: Student with IELTS
  scenarios.push({
    scenario_name: "student_with_ielts",
    campus_code: campus.code,
    has_ielts: true,
    english_levels_needed: 0,
    calculation: calculateTotalPreparationCost(campus, 0),
    description: `Sinh viên có IELTS 6.0+ tại ${campus.name}`,
  });

  // Scenario 2: Student needs 2 English levels
  scenarios.push({
    scenario_name: "student_2_english_levels",
    campus_code: campus.code,
    has_ielts: false,
    english_levels_needed: 2,
    calculation: calculateTotalPreparationCost(campus, 2),
    description: `Sinh viên cần 2 kỳ tiếng Anh tại ${campus.name}`,
  });

  // Scenario 3: Student needs 4 English levels
  scenarios.push({
    scenario_name: "student_4_english_levels",
    campus_code: campus.code,
    has_ielts: false,
    english_levels_needed: 4,
    calculation: calculateTotalPreparationCost(campus, 4),
    description: `Sinh viên cần 4 kỳ tiếng Anh tại ${campus.name}`,
  });

  return scenarios;
}

/**
 * Compare preparation costs between campuses
 */
export function comparePreparationCosts(
  campuses: CampusPublic[],
  englishLevelsNeeded = 0
) {
  return campuses
    .map((campus) => ({
      campus_code: campus.code,
      campus_name: campus.name,
      discount_percentage: campus.discount_percentage,
      calculation: calculateTotalPreparationCost(campus, englishLevelsNeeded),
    }))
    .sort(
      (a, b) =>
        a.calculation.total_preparation_cost -
        b.calculation.total_preparation_cost
    );
}

/**
 * Get English proficiency requirements
 */
export function getEnglishRequirements() {
  return {
    exemption_certificates: [
      "TOEFL iBT ≥80",
      "IELTS ≥6.0",
      "VSTEP bậc 4",
      "JLPT N3+",
      "TOPIK 4+",
      "HSK 4+",
    ],
    placement_test:
      "Sinh viên không có chứng chỉ sẽ được xếp lớp theo trình độ (0-6 kỳ)",
    max_levels: 6,
    mandatory_orientation: true,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate savings from campus discount
 */
export function calculateCampusSavings(
  standardFee: number,
  discountPercentage: number
): { discounted_fee: number; savings: number; savings_percentage: number } {
  const discountedFee = standardFee * (1 - discountPercentage / 100);
  const savings = standardFee - discountedFee;

  return {
    discounted_fee: discountedFee,
    savings: savings,
    savings_percentage: discountPercentage,
  };
}

/**
 * Validate English level input
 */
export function validateEnglishLevels(levels: number): boolean {
  return levels >= 0 && levels <= 6 && Number.isInteger(levels);
}

/**
 * Get fee explanation for chatbot
 */
export function getFeeExplanation(
  campus: CampusPublic,
  englishLevelsNeeded = 0
): string {
  const calculation = calculateTotalPreparationCost(
    campus,
    englishLevelsNeeded
  );
  const orientationFee = formatCurrency(calculation.orientation_cost);
  const englishFee = formatCurrency(calculation.english_prep_cost);
  const totalFee = formatCurrency(calculation.total_preparation_cost);

  let explanation = `Tại ${campus.name}:\n\n`;
  explanation += `📚 **Kỳ định hướng** (bắt buộc): ${orientationFee}\n`;

  if (englishLevelsNeeded > 0) {
    explanation += `🗣️ **Kỳ tiếng Anh** (${englishLevelsNeeded} kỳ): ${englishFee}\n`;
  } else {
    explanation += "🗣️ **Kỳ tiếng Anh**: Miễn (có IELTS 6.0+)\n";
  }

  explanation += `\n💰 **Tổng phí chuẩn bị**: ${totalFee}`;

  if (campus.discount_percentage > 0) {
    explanation += `\n🎯 **Đã áp dụng giảm giá ${campus.discount_percentage}%**`;
  }

  return explanation;
}

/**
 * Export all utility functions
 */
export const PreparationFeesUtils = {
  calculateTotalPreparationCost,
  getPreparationFeesByType,
  formatPreparationFeesForAPI,
  generateFeeScenarios,
  comparePreparationCosts,
  getEnglishRequirements,
  formatCurrency,
  calculateCampusSavings,
  validateEnglishLevels,
  getFeeExplanation,
};
