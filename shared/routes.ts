import { z } from 'zod';
import {
  insertAnnouncementSchema,
  insertPanelSchema,
  insertAchievementSchema,
  insertDepartmentSchema,
  insertRegistrationSchema,
  insertMediaCoverageSchema,
  announcements,
  panels,
  achievements,
  departments,
  registrations,
  mediaCoverage
} from './schema';

// === ERROR SCHEMAS ===
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

// === API TYPES ===
export type CreateRegistrationRequest = z.infer<typeof insertRegistrationSchema>;
export type UpdateRegistrationRequest = Partial<CreateRegistrationRequest>;

// === API CONTRACT ===
export const api = {
  announcements: {
    list: {
      method: 'GET' as const,
      path: '/api/announcements',
      responses: {
        200: z.array(z.custom<typeof announcements.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/announcements',
      input: insertAnnouncementSchema,
      responses: {
        201: z.custom<typeof announcements.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/announcements/:id',
      input: insertAnnouncementSchema.partial(),
      responses: {
        200: z.custom<typeof announcements.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/announcements/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  panels: {
    list: {
      method: 'GET' as const,
      path: '/api/panels',
      input: z.object({
        type: z.enum(['state', 'district']).optional(),
        district: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof panels.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/panels',
      input: insertPanelSchema,
      responses: {
        201: z.custom<typeof panels.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/panels/:id',
      input: insertPanelSchema.partial(),
      responses: {
        200: z.custom<typeof panels.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/panels/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  achievements: {
    list: {
      method: 'GET' as const,
      path: '/api/achievements',
      responses: {
        200: z.array(z.custom<typeof achievements.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/achievements',
      input: insertAchievementSchema,
      responses: {
        201: z.custom<typeof achievements.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/achievements/:id',
      input: insertAchievementSchema.partial(),
      responses: {
        200: z.custom<typeof achievements.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/achievements/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  mediaCoverage: {
    list: {
      method: 'GET' as const,
      path: '/api/media-coverage',
      responses: {
        200: z.array(z.custom<typeof mediaCoverage.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/media-coverage',
      input: insertMediaCoverageSchema,
      responses: {
        201: z.custom<typeof mediaCoverage.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/media-coverage/:id',
      input: insertMediaCoverageSchema.partial(),
      responses: {
        200: z.custom<typeof mediaCoverage.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/media-coverage/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  departments: {
    list: {
      method: 'GET' as const,
      path: '/api/departments',
      responses: {
        200: z.array(z.custom<typeof departments.$inferSelect>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/departments/:id',
      input: insertDepartmentSchema.partial(),
      responses: {
        200: z.custom<typeof departments.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  registrations: {
    search: {
      method: 'GET' as const,
      path: '/api/registrations/search',
      input: z.object({
        tgmcId: z.string().optional(),
        phone: z.string().optional(),
      }),
      responses: {
        200: z.array(z.custom<typeof registrations.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/registrations',
      input: insertRegistrationSchema,
      responses: {
        201: z.custom<typeof registrations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/registrations/:id',
      input: insertRegistrationSchema.partial(),
      responses: {
        200: z.custom<typeof registrations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/admin/registrations',
      responses: {
        200: z.array(z.custom<typeof registrations.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
