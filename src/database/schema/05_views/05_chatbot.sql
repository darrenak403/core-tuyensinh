-- =====================================================
-- CHATBOT VIEWS
-- Purpose: Views for chatbot analytics and conversation management
-- =====================================================

-- Conversation summary view
CREATE OR REPLACE VIEW v_chatbot_conversations_summary AS
SELECT
    c.id,
    c.session_id,
    c.started_at,
    c.ended_at,
    c.total_messages,
    c.satisfaction_rating,
    c.conversation_summary,
    -- Application info if created
    CASE 
        WHEN c.created_application_id IS NOT NULL THEN
            jsonb_build_object(
                'id', a.id,
                'code', a.application_code,
                'status', a.status
            )
        ELSE NULL
    END as created_application,
    -- Conversation duration
    CASE 
        WHEN c.ended_at IS NOT NULL THEN
            EXTRACT(EPOCH FROM (c.ended_at - c.started_at)) / 60.0
        ELSE NULL
    END as duration_minutes
FROM chatbot_conversations c
LEFT JOIN applications a ON c.created_application_id = a.id;

-- Popular intents view
CREATE OR REPLACE VIEW v_popular_intents AS
SELECT
    ui.intent_name,
    COUNT(*) as intent_count,
    AVG(ui.confidence_score) as avg_confidence,
    COUNT(*) FILTER (WHERE ui.resolved = true) as resolved_count,
    COUNT(*) FILTER (WHERE ui.resolved = false) as unresolved_count,
    ROUND(
        COUNT(*) FILTER (WHERE ui.resolved = true) * 100.0 / COUNT(*), 
        2
    ) as resolution_rate
FROM user_intents ui
WHERE ui.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ui.intent_name
ORDER BY intent_count DESC;

-- Daily chatbot metrics view
CREATE OR REPLACE VIEW v_daily_chatbot_metrics AS
SELECT
    DATE(started_at) as metric_date,
    COUNT(*) as total_conversations,
    COUNT(*) FILTER (WHERE ended_at IS NOT NULL) as completed_conversations,
    COUNT(*) FILTER (WHERE created_application_id IS NOT NULL) as conversations_with_applications,
    AVG(total_messages) as avg_messages_per_conversation,
    AVG(satisfaction_rating) FILTER (WHERE satisfaction_rating IS NOT NULL) as avg_satisfaction
FROM chatbot_conversations
WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(started_at)
ORDER BY metric_date DESC;

-- TODO: Add more chatbot views as needed
-- - Message analysis views
-- - User journey analysis
-- - Intent resolution tracking
-- - Performance metrics by time periods
