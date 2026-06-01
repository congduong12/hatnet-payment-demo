import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard.js';
import { CurrentAuth } from '../auth/current-auth.decorator.js';
import type { VerifiedAuth } from '../auth/auth.types.js';
import { CartService } from './cart.service.js';
import type { AddCartItemBody, UpdateCartItemBody } from './dto/cart.dto.js';
import type { CartSummary } from './cart.types.js';

@UseGuards(ClerkAuthGuard)
@Controller('cart')
export class CartController {
  constructor(@Inject(CartService) private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentAuth() auth: VerifiedAuth): Promise<{ cart: CartSummary }> {
    return {
      cart: await this.cartService.getCart(auth),
    };
  }

  @Post('items')
  async addItem(@CurrentAuth() auth: VerifiedAuth, @Body() body: AddCartItemBody): Promise<{ cart: CartSummary }> {
    return {
      cart: await this.cartService.addItem(auth, body),
    };
  }

  @Patch('items/:itemId')
  async updateItem(
    @CurrentAuth() auth: VerifiedAuth,
    @Param('itemId') itemId: string,
    @Body() body: UpdateCartItemBody,
  ): Promise<{ cart: CartSummary }> {
    return {
      cart: await this.cartService.updateItem(auth, itemId, body),
    };
  }

  @Delete('items/:itemId')
  async removeItem(@CurrentAuth() auth: VerifiedAuth, @Param('itemId') itemId: string): Promise<{ cart: CartSummary }> {
    return {
      cart: await this.cartService.removeItem(auth, itemId),
    };
  }

  @Delete()
  async clearCart(@CurrentAuth() auth: VerifiedAuth): Promise<{ cart: CartSummary }> {
    return {
      cart: await this.cartService.clearCart(auth),
    };
  }
}
