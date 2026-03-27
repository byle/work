import { pool } from '../../db/pool';

export async function getDashboardSummary() {
  const [projectResult, workOrderResult, setupListResult] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'draft')::int AS draft_count FROM projects WHERE is_deleted = FALSE`),
    pool.query(`SELECT COUNT(*)::int AS total,
                       COUNT(*) FILTER (WHERE status IN ('pending_assign', 'pending_review'))::int AS pending_count,
                       COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress_count,
                       COUNT(*) FILTER (WHERE status = 'approved')::int AS approved_count
                FROM work_orders WHERE is_deleted = FALSE`),
    pool.query(`SELECT COUNT(*)::int AS total FROM setup_lists WHERE is_deleted = FALSE`)
  ]);

  return {
    projectsTotal: Number(projectResult.rows[0].total),
    projectsDraft: Number(projectResult.rows[0].draft_count),
    workOrdersTotal: Number(workOrderResult.rows[0].total),
    workOrdersPending: Number(workOrderResult.rows[0].pending_count),
    workOrdersInProgress: Number(workOrderResult.rows[0].in_progress_count),
    workOrdersApproved: Number(workOrderResult.rows[0].approved_count),
    setupListsTotal: Number(setupListResult.rows[0].total)
  };
}
