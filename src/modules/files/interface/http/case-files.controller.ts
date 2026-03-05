import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Throttle } from '@nestjs/throttler';
import { UploadCaseFilesUseCase } from '../../application/use-cases/upload-case-files.use-case';
import { ListCaseFilesUseCase } from '../../application/use-cases/list-case-files.use-case';
import { UploadCaseFilesRequestDto } from './dto/upload-case-files.request.dto';
import { UploadCaseFilesResponseDto } from './dto/upload-case-files.response.dto';
import { FileBatchResponseDto } from './dto/file-batch.response.dto';
import { CaseFileResponseDto } from './dto/case-file.response.dto';
import { ListCaseFilesQueryDto } from './dto/list-case-files.query.dto';
import { ListCaseFilesResponseDto } from './dto/list-case-files.response.dto';

const MAX_FILES_PER_UPLOAD = Number(process.env.MAX_FILES_PER_UPLOAD ?? 20);
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB ?? 15);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

@ApiTags('Files')
@Controller('cases')
export class CaseFilesController {
  constructor(
    private readonly uploadCaseFilesUseCase: UploadCaseFilesUseCase,
    private readonly listCaseFilesUseCase: ListCaseFilesUseCase,
  ) {}

  @Post(':caseId/files')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES_PER_UPLOAD, {
      storage: memoryStorage(),
      limits: {
        files: MAX_FILES_PER_UPLOAD,
        fileSize: MAX_FILE_SIZE_BYTES,
      },
    }),
  )
  @ApiOperation({ summary: 'Upload a batch of files for a case' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['batchTitle', 'batchDescription', 'files'],
      properties: {
        batchTitle: { type: 'string', minLength: 3, maxLength: 120 },
        batchDescription: { type: 'string', minLength: 10, maxLength: 1000 },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiCreatedResponse({ type: UploadCaseFilesResponseDto })
  async upload(
    @Param('caseId', new ParseUUIDPipe()) caseId: string,
    @Body() body: UploadCaseFilesRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadCaseFilesResponseDto> {
    const result = await this.uploadCaseFilesUseCase.execute({
      caseId,
      batchTitle: body.batchTitle,
      batchDescription: body.batchDescription,
      files: (files ?? []).map((file) => ({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      })),
    });

    return {
      batch: FileBatchResponseDto.fromDomain(result.batch),
      files: result.files.map((file) => CaseFileResponseDto.fromDomain(file)),
    };
  }

  @Get(':caseId/files')
  @ApiOperation({ summary: 'List files of a case' })
  @ApiOkResponse({ type: ListCaseFilesResponseDto })
  async list(
    @Param('caseId', new ParseUUIDPipe()) caseId: string,
    @Query() query: ListCaseFilesQueryDto,
  ): Promise<ListCaseFilesResponseDto> {
    const result = await this.listCaseFilesUseCase.execute({
      caseId,
      page: query.page,
      limit: query.limit,
      batchId: query.batchId,
      search: query.search,
    });

    return {
      data: result.data.map((file) => CaseFileResponseDto.fromDomain(file)),
      meta: result.meta,
    };
  }
}
