import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { SubmitOrderResultsDto } from './dto/submit-order-results.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LAB_USER)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get()
  getOrders() {
    return this.ordersService.getOrders();
  }

  @Get(':id/form')
  getOrderForm(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderForm(id);
  }

  @Post(':id/results')
  submitOrderResults(
    @Param('id', ParseIntPipe) id: number,
    @Body() submitOrderResultsDto: SubmitOrderResultsDto,
  ) {
    return this.ordersService.submitOrderResults(id, submitOrderResultsDto);
  }

  @Get(':id/results')
  getOrderResults(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderResults(id);
  }
}
