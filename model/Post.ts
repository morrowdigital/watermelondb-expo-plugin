import { Model } from "@nozbe/watermelondb";
import { text, field } from "@nozbe/watermelondb/decorators";

// @ts-ignore
export default class Post extends Model {
  static table = "posts";

  static associations = {
    comments: { type: "has_many", foreignKey: "post_id" },
  };

  @text("title") title!: string;
  @text("body") body!: string;
  @field("is_pinned") isPinned!: boolean;
}
