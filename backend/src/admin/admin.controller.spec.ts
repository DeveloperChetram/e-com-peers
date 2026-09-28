import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            getStats: vi.fn(),
            getUsers: vi.fn(),
            getUser: vi.fn(),
            updateUserStatus: vi.fn(),
            updateUserRole: vi.fn(),
            deleteUser: vi.fn(),
            getProviders: vi.fn(),
            getProvider: vi.fn(),
            updateProviderStatus: vi.fn(),
            approveProvider: vi.fn(),
            rejectProvider: vi.fn(),
            deleteProvider: vi.fn(),
            getProducts: vi.fn(),
            getProduct: vi.fn(),
            approveProduct: vi.fn(),
            rejectProduct: vi.fn(),
            deleteProduct: vi.fn(),
            getCategories: vi.fn(),
            getCategory: vi.fn(),
            getCategoryProducts: vi.fn(),
            createCategory: vi.fn(),
            updateCategory: vi.fn(),
            deleteCategory: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
