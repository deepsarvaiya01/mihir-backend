import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { SignaturesService } from './signatures.service';

@ApiTags('Signatures')
@ApiBearerAuth()
@Controller('signatures')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SignaturesController {
  constructor(private readonly service: SignaturesService) {}

  @Get()
  @ApiOperation({ summary: 'List all signatures' })
  getAll() {
    return this.service.getAll();
  }

  @Get('active')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
  @ApiOperation({ summary: 'Get the currently active signature' })
  getActive() {
    return this.service.getActive();
  }

  @Post()
  @ApiOperation({ summary: 'Upload a new signature image' })
  create(@Body() dto: CreateSignatureDto) {
    return this.service.create(dto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Set a signature as the active/default one for reports' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.service.activate(id);
  }

  @Patch('deactivate-all')
  @ApiOperation({ summary: 'Deactivate all signatures (no active signature)' })
  deactivateAll() {
    return this.service.deactivateAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a signature' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
