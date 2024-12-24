const { default: mongoose } = require("mongoose");

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  authorName: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BlogPostSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  coverImage: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
  },
  comments: [CommentSchema],
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

BlogPostSchema.index({ title: "text" });

export default mongoose.models.BlogPost ||
  mongoose.model("BlogPost", BlogPostSchema);
