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
import { CreateBatchOrdersDto } from './dto/create-batch-orders.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { SubmitOrderResultsDto } from './dto/submit-order-results.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new diagnostic order' })
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
  @ApiOperation({ summary: 'Get all orders' })
  getOrders() {
    return this.ordersService.getOrders();
  }

  @Get(':id/form')
  @ApiOperation({ summary: 'Get order form with template fields' })
  getOrderForm(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderForm(id);
  }

  @Post(':id/results')
  @ApiOperation({ summary: 'Submit test results for an order' })
  submitOrderResults(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitOrderResultsDto: SubmitOrderResultsDto,
  ) {
    return this.ordersService.submitOrderResults(id, submitOrderResultsDto);
  }

  @Get(':id/results')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
  @ApiOperation({ summary: 'Get results for an order' })
  getOrderResults(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderResults(id);
  }

  @Post(':id/approve')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve an order' })
  approveOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.approveOrder(id);
  }

  @Post(':id/reject')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reject an order' })
  rejectOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.rejectOrder(id);
  }

  @Patch(':id/reopen')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
  @ApiOperation({ summary: 'Reopen a rejected order (clears previous results)' })
  reopenOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.reopenOrder(id);
  }

  @Post('batch')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
  @ApiOperation({ summary: 'Create multiple orders with payment info' })
  createBatchOrders(@Body() dto: CreateBatchOrdersDto) {
    return this.ordersService.createBatchOrders(dto);
  }

  @Patch(':id/payment')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
  @ApiOperation({ summary: 'Update payment details for an order' })
  updatePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.ordersService.updatePayment(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pending or rejected order' })
  deleteOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.deleteOrder(id);
  }
}
