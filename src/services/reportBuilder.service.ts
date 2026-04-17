import mongoose, { Types } from 'mongoose';
import { ReportDefinitionInput, reportWhitelist } from '../schemas/report.schema.js';

export class ReportBuilderService {
  /**
   * Builds a MongoDB aggregation pipeline from the provided report configuration.
   * Ensures the tenantId match is the first stage.
   * Validates filters against the whitelist to prevent unauthorized field access.
   */
  public buildPipeline(config: ReportDefinitionInput, tenantId: Types.ObjectId): any[] {
    const pipeline: any[] = [];

    // 1. Mandatory tenantId filtering as the first stage
    pipeline.push({ $match: { tenantId } });

    const whitelist = reportWhitelist[config.baseModel];
    if (!whitelist) {
      throw new Error(`Invalid base model: ${config.baseModel}`);
    }

    // 2. Add filters based on metadata
    if (config.filters && config.filters.length > 0) {
      config.filters.forEach(filter => {
        // Strict whitelist validation for field name
        if (!whitelist.includes(filter.field)) {
          throw new Error(`Field '${filter.field}' is not allowed in filters for model ${config.baseModel}`);
        }

        // operator validation is handled by Zod schema, but we double-check here
        const allowedOperators = ['$eq', '$gt', '$lt', '$in', '$regex'];
        if (!allowedOperators.includes(filter.operator)) {
            throw new Error(`Operator '${filter.operator}' is not allowed`);
        }

        pipeline.push({
          $match: {
            [filter.field]: { [filter.operator]: filter.value }
          }
        });
      });
    }

    // 3. Add sort stage
    if (config.sort && config.sort.length > 0) {
      const sortStage: Record<string, 1 | -1> = {};
      config.sort.forEach(s => {
        sortStage[s.field] = s.order === 'asc' ? 1 : -1;
      });
      pipeline.push({ $sort: sortStage });
    }

    // 4. Add projection stage based on columns
    if (config.columns && config.columns.length > 0) {
      const projectStage: Record<string, number> = { _id: 0 };
      config.columns.forEach(col => {
        projectStage[col.field] = 1;
      });
      pipeline.push({ $project: projectStage });
    }

    return pipeline;
  }

  /**
   * Executes a custom report by dynamically selecting the model and running the aggregation.
   */
  public async executeReport(config: ReportDefinitionInput, tenantId: Types.ObjectId): Promise<any[]> {
    const pipeline = this.buildPipeline(config, tenantId);
    const Model = mongoose.model(config.baseModel);
    return Model.aggregate(pipeline).exec();
  }
}

export const reportBuilderService = new ReportBuilderService();
