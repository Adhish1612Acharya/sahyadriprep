import { SegmentMediaAttachment } from "@/models";

export type LinkSegmentMediaInput = Pick<
  SegmentMediaAttachment,
  "segment_id" | "media_id" | "created_by" | "label"
> &
  Partial<Pick<SegmentMediaAttachment, "position">>;
