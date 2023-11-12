import { Shortcut as ShortcutPb } from "@/types/proto/api/v2/shortcut_service";

export const convertShortcutFromPb = (shortcutMessage: ShortcutPb): Shortcut => {
  return {
    id: shortcutMessage.id,
    creatorId: shortcutMessage.creatorId,
    createdTs: shortcutMessage.createdTime?.getTime() || 0,
    updatedTs: shortcutMessage.updatedTime?.getTime() || 0,
    name: shortcutMessage.name,
    link: shortcutMessage.link,
    title: shortcutMessage.title,
    description: shortcutMessage.description,
    tags: shortcutMessage.tags,
  } as Shortcut;
};
