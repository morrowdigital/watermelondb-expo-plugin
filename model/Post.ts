import { Model } from "@nozbe/watermelondb";
import { text, field } from "@nozbe/watermelondb/decorators";

export default class Post extends Model {
  static table = "posts";

  static associations = {
    comments: { type: "has_many", foreignKey: "post_id" },
  };

  @text("title") title;
  @text("body") body;
  @field("is_pinned") isPinned;
}
