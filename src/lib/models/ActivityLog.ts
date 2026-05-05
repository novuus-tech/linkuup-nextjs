import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

/**
 * Journal d'audit global — qui a fait quoi sur quelle entité.
 * Document immuable : jamais modifié ni supprimé après écriture.
 */
const activityLogSchema = new mongoose.Schema(
  {
    /** Utilisateur qui a effectué l'action (null = système) */
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    /** Snapshot dénormalisé de l'acteur (utile si l'utilisateur est supprimé plus tard) */
    actorLabel: { type: String, trim: true },

    /** Type d'action effectuée */
    action: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'activated', 'deactivated'],
      required: true,
      index: true,
    },

    /** Type d'entité ciblée */
    targetType: {
      type: String,
      enum: ['Appointment', 'User'],
      required: true,
      index: true,
    },
    /** Identifiant de l'entité (peut pointer vers un doc supprimé) */
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    /** Libellé lisible (ex: "Dr Martin — 12/05 14:00" ou "jean@x.com") */
    targetLabel: { type: String, trim: true },

    /** Diff des champs : { status: { from: 'pending', to: 'confirmed' } } */
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /** Métadonnées (IP, user-agent…) */
    ip: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
activityLogSchema.index({ actorId: 1, createdAt: -1 });

activityLogSchema.plugin(mongoosePaginate);

const ActivityLog =
  mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
