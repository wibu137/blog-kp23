import mongoose from 'mongoose';

const citationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: '',
    },
    excerpt: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    citations: {
      type: [citationSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const conversationSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Cuoc tro chuyen moi',
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    memory: {
      shortTerm: {
        type: String,
        default: '',
      },
      longTerm: {
        type: String,
        default: '',
      },
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model('Conversation', conversationSchema);

export default Conversation;
