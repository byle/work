import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { requireAuth } from '../../shared/auth';
import { success } from '../../shared/http';
import { createAttachment, listAttachments } from './attachment.repository';

export const attachmentRouter = Router();

attachmentRouter.use(requireAuth);

attachmentRouter.get(
  '/:bizType/:bizId',
  asyncHandler(async (req, res) => {
    const bizType = String(req.params.bizType);
    const bizId = Number(req.params.bizId);
    const list = await listAttachments(bizType, bizId);
    return success(res, list);
  })
);

attachmentRouter.post(
  '/:bizType/:bizId',
  asyncHandler(async (req, res) => {
    const bizType = String(req.params.bizType);
    const bizId = Number(req.params.bizId);
    const attachment = await createAttachment({
      bizType,
      bizId,
      fileName: req.body.fileName,
      fileType: req.body.fileType,
      contentBase64: req.body.contentBase64,
      uploadedBy: req.user?.id
    });

    return success(res, attachment, 'attachment uploaded');
  })
);
