import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ImportExportService, ImportResult } from './import-export.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';

@ApiTags('Import / Export')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('import-export')
export class ImportExportController {
  private readonly logger = new Logger(ImportExportController.name);

  constructor(private readonly importExportService: ImportExportService) {}

  @Post('csv/patients')
  @Scopes(Scope.ADMIN, Scope.HOSPITAL)
  @ApiOperation({ summary: 'Importer des patients via fichier CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req: any, file: any, cb: (err: Error | null, name: string) => void) => {
          const ext = extname(file.originalname);
          cb(null, `${uuidv4()}${ext}`);
        },
      }),
      fileFilter: (_req: any, file: any, cb: (err: Error | null, accept: boolean) => void) => {
        if (!file.originalname.match(/\.(csv)$/i)) {
          cb(new Error('Seuls les fichiers CSV sont acceptés'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async importPatients(
    @UploadedFile() file: any,
    @CurrentUser() user: JwtPayload,
  ): Promise<ImportResult> {
    if (!file) {
      return { imported: 0, errors: [{ row: -1, message: 'Aucun fichier fourni' }], totalRows: 0 };
    }
    return this.importExportService.importPatientsFromCsv(file.path, user?.sub);
  }
}
