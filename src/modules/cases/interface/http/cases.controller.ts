import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCaseUseCase } from '../../application/use-cases/create-case.use-case';
import { GetCaseByIdUseCase } from '../../application/use-cases/get-case-by-id.use-case';
import { ListCasesUseCase } from '../../application/use-cases/list-cases.use-case';
import { CreateCaseRequestDto } from './dto/create-case.request.dto';
import { CaseResponseDto } from './dto/case.response.dto';
import { ListCasesQueryDto } from './dto/list-cases.query.dto';
import { ListCasesResponseDto } from './dto/list-cases.response.dto';

@ApiTags('Cases')
@Controller('cases')
export class CasesController {
  constructor(
    private readonly createCaseUseCase: CreateCaseUseCase,
    private readonly getCaseByIdUseCase: GetCaseByIdUseCase,
    private readonly listCasesUseCase: ListCasesUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List cases' })
  @ApiOkResponse({ type: ListCasesResponseDto })
  async list(@Query() query: ListCasesQueryDto): Promise<ListCasesResponseDto> {
    const result = await this.listCasesUseCase.execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });

    return {
      data: result.data.map((item) => CaseResponseDto.fromDomain(item)),
      meta: result.meta,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a legal case' })
  @ApiCreatedResponse({ type: CaseResponseDto })
  async create(@Body() body: CreateCaseRequestDto): Promise<CaseResponseDto> {
    const created = await this.createCaseUseCase.execute({
      code: body.code,
      title: body.title,
      description: body.description,
      status: body.status,
      openedAt: body.openedAt ? new Date(body.openedAt) : undefined,
      closedAt: body.closedAt ? new Date(body.closedAt) : undefined,
      clientId: body.clientId,
      createdById: body.createdById,
    });

    return CaseResponseDto.fromDomain(created);
  }

  @Get(':caseId')
  @ApiOperation({ summary: 'Get case detail by id' })
  @ApiOkResponse({ type: CaseResponseDto })
  async getById(
    @Param('caseId', new ParseUUIDPipe()) caseId: string,
  ): Promise<CaseResponseDto> {
    const found = await this.getCaseByIdUseCase.execute(caseId);
    return CaseResponseDto.fromDomain(found);
  }
}
