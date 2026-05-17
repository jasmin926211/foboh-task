const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'FOBOH APIs',
    version: '1.0.0',
    description: ''
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Products', description: 'Product catalog' },
    { name: 'Customers', description: 'Customer management' },
    { name: 'Customer Groups', description: 'Customer group management & membership' },
    { name: 'Pricing Profiles', description: 'Pricing profile CRUD' },
    { name: 'Price Resolution', description: 'Resolve effective prices using specificity tiers' }
  ],
  paths: {
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List all products',
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by product title'
          }
        ],
        responses: {
          200: {
            description: 'Array of products',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a product by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: {
          200: {
            description: 'Product details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Product' } }
                }
              }
            }
          },
          404: { description: 'Product not found' }
        }
      },
      put: {
        tags: ['Products'],
        summary: 'Update product cost price and margin settings',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  costPrice: {
                    type: 'number',
                    nullable: true,
                    description: 'Cost price for floor calculation'
                  },
                  minMarginPercent: {
                    type: 'number',
                    nullable: true,
                    minimum: 0,
                    maximum: 100,
                    description: 'Minimum margin percentage (0-100)'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Product updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Product' } }
                }
              }
            }
          },
          404: { description: 'Product not found' }
        }
      },
      delete: {
        tags: ['Products'],
        summary: 'Soft-delete a product',
        description: 'Sets deletedAt and removes all profileProduct junction rows so pricing profiles no longer reference it.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: {
          200: {
            description: 'Product soft-deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Product' } }
                }
              }
            }
          },
          404: { description: 'Product not found' }
        }
      }
    },
    '/customers': {
      get: {
        tags: ['Customers'],
        summary: 'List all customers',
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by name or email'
          }
        ],
        responses: {
          200: {
            description: 'Array of customers',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Customer' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Customers'],
        summary: 'Create a customer',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  email: { type: 'string', format: 'email' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Customer created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Customer' } }
                }
              }
            }
          },
          400: { description: 'Validation error' }
        }
      }
    },
    '/customers/{id}': {
      get: {
        tags: ['Customers'],
        summary: 'Get a customer by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: {
          200: {
            description: 'Customer details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Customer' } }
                }
              }
            }
          },
          404: { description: 'Customer not found' }
        }
      },
      put: {
        tags: ['Customers'],
        summary: 'Update a customer',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  email: { type: 'string', format: 'email', nullable: true }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Customer updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Customer' } }
                }
              }
            }
          },
          404: { description: 'Customer not found' }
        }
      },
      delete: {
        tags: ['Customers'],
        summary: 'Delete a customer',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: {
          200: { description: 'Customer deleted' },
          404: { description: 'Customer not found' }
        }
      }
    },
    '/customer-groups': {
      get: {
        tags: ['Customer Groups'],
        summary: 'List all customer groups',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name' }
        ],
        responses: {
          200: {
            description: 'Array of customer groups',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/CustomerGroup' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Customer Groups'],
        summary: 'Create a customer group',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string', maxLength: 500 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Group created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/CustomerGroup' } }
                }
              }
            }
          },
          400: { description: 'Validation error' }
        }
      }
    },
    '/customer-groups/{id}': {
      get: {
        tags: ['Customer Groups'],
        summary: 'Get a customer group by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: {
          200: {
            description: 'Group details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/CustomerGroup' } }
                }
              }
            }
          },
          404: { description: 'Group not found' }
        }
      },
      put: {
        tags: ['Customer Groups'],
        summary: 'Update a customer group',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string', maxLength: 500, nullable: true }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Group updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/CustomerGroup' } }
                }
              }
            }
          },
          404: { description: 'Group not found' }
        }
      },
      delete: {
        tags: ['Customer Groups'],
        summary: 'Delete a customer group',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: {
          200: { description: 'Group deleted' },
          404: { description: 'Group not found' }
        }
      }
    },
    '/customer-groups/{id}/members': {
      post: {
        tags: ['Customer Groups'],
        summary: 'Add a customer to a group',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Group ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customerId'],
                properties: {
                  customerId: { type: 'string', format: 'uuid' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Member added' },
          404: { description: 'Group or customer not found' },
          409: { description: 'Customer already in group' }
        }
      }
    },
    '/customer-groups/{id}/members/{customerId}': {
      delete: {
        tags: ['Customer Groups'],
        summary: 'Remove a customer from a group',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Group ID'
          },
          {
            name: 'customerId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Customer ID'
          }
        ],
        responses: {
          200: { description: 'Member removed' },
          404: { description: 'Membership not found' }
        }
      }
    },
    '/pricing-profiles': {
      get: {
        tags: ['Pricing Profiles'],
        summary: 'List pricing profiles (paginated)',
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by profile name, customer, or group'
          },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['draft', 'published'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
          }
        ],
        responses: {
          200: {
            description: 'Paginated list of pricing profiles',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/PricingProfile' }
                        },
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        totalPages: { type: 'integer' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Pricing Profiles'],
        summary: 'Create a pricing profile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProfilePayload' }
            }
          }
        },
        responses: {
          201: {
            description: 'Profile created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/PricingProfile' } }
                }
              }
            }
          },
          400: { description: 'Validation error' }
        }
      }
    },
    '/pricing-profiles/check-name': {
      get: {
        tags: ['Pricing Profiles'],
        summary: 'Check if a profile name already exists',
        parameters: [
          {
            name: 'name',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Profile name to check'
          },
          {
            name: 'excludeId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Profile ID to exclude (for edit)'
          }
        ],
        responses: {
          200: {
            description: 'Name availability',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'object', properties: { exists: { type: 'boolean' } } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/pricing-profiles/{id}': {
      get: {
        tags: ['Pricing Profiles'],
        summary: 'Get a pricing profile by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: {
          200: {
            description: 'Profile details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/PricingProfile' } }
                }
              }
            }
          },
          404: { description: 'Profile not found' }
        }
      },
      put: {
        tags: ['Pricing Profiles'],
        summary: 'Update a pricing profile',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfilePayload' }
            }
          }
        },
        responses: {
          200: {
            description: 'Profile updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/PricingProfile' } }
                }
              }
            }
          },
          404: { description: 'Profile not found' },
          422: { description: 'Cannot publish -negative prices detected' }
        }
      },
      delete: {
        tags: ['Pricing Profiles'],
        summary: 'Delete a pricing profile',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: {
          200: { description: 'Profile deleted' },
          404: { description: 'Profile not found' }
        }
      }
    },
    '/resolved-prices': {
      get: {
        tags: ['Price Resolution'],
        summary: 'Resolve prices for all products for a customer',
        description:
          'Returns the effective price for every product, using the 6-tier specificity strategy (most specific wins).',
        parameters: [
          {
            name: 'customerId',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Customer ID'
          }
        ],
        responses: {
          200: {
            description: 'Array of resolved prices',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/ResolvedPrice' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/preview-prices': {
      post: {
        tags: ['Price Resolution'],
        summary: 'Preview prices for a hypothetical profile',
        description:
          'Calculates what prices would be without saving a profile. Useful for the setup flow.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['adjustmentType'],
                properties: {
                  productIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                  adjustmentType: { type: 'string', enum: ['fixed', 'dynamic', 'custom'] },
                  adjustmentDirection: { type: 'string', enum: ['increase', 'decrease'] },
                  adjustmentValue: { type: 'number' },
                  scope: { type: 'string', enum: ['all', 'selected'], default: 'selected' },
                  customPrices: {
                    type: 'object',
                    additionalProperties: { type: 'number' },
                    description: 'Map of productId → custom price (for custom adjustment type)'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Preview of calculated prices',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          productId: { type: 'string', format: 'uuid' },
                          productTitle: { type: 'string' },
                          basePrice: { type: 'number' },
                          newPrice: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          sku: { type: 'string' },
          basePrice: { type: 'number' },
          costPrice: {
            type: 'number',
            nullable: true,
            description: 'Cost price for floor calculation'
          },
          minMarginPercent: {
            type: 'number',
            nullable: true,
            description: 'Minimum margin percentage (0-100)'
          },
          category: { type: 'string' },
          imageUrl: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          memberships: {
            type: 'array',
            items: { $ref: '#/components/schemas/CustomerGroupMembership' }
          }
        }
      },
      CustomerGroup: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          memberships: {
            type: 'array',
            items: { $ref: '#/components/schemas/CustomerGroupMembership' }
          },
          _count: {
            type: 'object',
            properties: {
              memberships: { type: 'integer' }
            }
          }
        }
      },
      CustomerGroupMembership: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          customerId: { type: 'string', format: 'uuid' },
          customerGroupId: { type: 'string', format: 'uuid' },
          customer: { $ref: '#/components/schemas/Customer' },
          customerGroup: { $ref: '#/components/schemas/CustomerGroup' }
        }
      },
      PricingProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          customerId: { type: 'string', format: 'uuid', nullable: true },
          customerGroupId: { type: 'string', format: 'uuid', nullable: true },
          adjustmentType: { type: 'string', enum: ['fixed', 'dynamic', 'custom'] },
          adjustmentDirection: { type: 'string', enum: ['increase', 'decrease'], nullable: true },
          adjustmentValue: { type: 'number', nullable: true },
          status: { type: 'string', enum: ['draft', 'published'] },
          scope: { type: 'string', enum: ['all', 'selected'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          customer: { $ref: '#/components/schemas/Customer' },
          customerGroup: { $ref: '#/components/schemas/CustomerGroup' },
          profileProducts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                productId: { type: 'string', format: 'uuid' },
                customPrice: { type: 'number', nullable: true },
                product: { $ref: '#/components/schemas/Product' }
              }
            }
          }
        }
      },
      CreateProfilePayload: {
        type: 'object',
        required: ['name', 'adjustmentType'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          customerId: {
            type: 'string',
            format: 'uuid',
            description: 'Target a specific customer (mutually exclusive with customerGroupId)'
          },
          customerGroupId: {
            type: 'string',
            format: 'uuid',
            description: 'Target a customer group (mutually exclusive with customerId)'
          },
          adjustmentType: { type: 'string', enum: ['fixed', 'dynamic', 'custom'] },
          adjustmentDirection: {
            type: 'string',
            enum: ['increase', 'decrease'],
            description: 'Required for fixed/dynamic'
          },
          adjustmentValue: { type: 'number', description: 'Required for fixed/dynamic' },
          status: { type: 'string', enum: ['draft', 'published'], default: 'draft' },
          scope: { type: 'string', enum: ['all', 'selected'], default: 'selected' },
          productIds: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            description: "Required when scope is 'selected'"
          },
          customPrices: {
            type: 'object',
            additionalProperties: { type: 'number' },
            description: 'Map of productId → price (required for custom adjustment type)'
          }
        }
      },
      UpdateProfilePayload: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          customerId: { type: 'string', format: 'uuid', nullable: true },
          customerGroupId: { type: 'string', format: 'uuid', nullable: true },
          adjustmentType: { type: 'string', enum: ['fixed', 'dynamic', 'custom'] },
          adjustmentDirection: { type: 'string', enum: ['increase', 'decrease'], nullable: true },
          adjustmentValue: { type: 'number', nullable: true },
          status: { type: 'string', enum: ['draft', 'published'] },
          scope: { type: 'string', enum: ['all', 'selected'] },
          productIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          customPrices: {
            type: 'object',
            additionalProperties: { type: 'number' }
          }
        }
      },
      ResolvedPrice: {
        type: 'object',
        properties: {
          productId: { type: 'string', format: 'uuid' },
          productTitle: { type: 'string' },
          basePrice: { type: 'number' },
          finalPrice: {
            type: 'number',
            description: 'Effective price after tier resolution and floor protection'
          },
          appliedProfile: {
            type: 'object',
            nullable: true,
            description: 'Winning profile',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' }
            }
          },
          tier: {
            type: 'integer',
            nullable: true,
            description: 'Winning tier (1-6), null if base price'
          },
          tierLabel: {
            type: 'string',
            nullable: true,
            description: 'Human-readable tier description'
          },
          reason: { type: 'string' },
          costPrice: { type: 'number', nullable: true, description: 'Product cost price' },
          minMarginPercent: { type: 'number', nullable: true, description: 'Product min margin %' },
          floorPrice: {
            type: 'number',
            nullable: true,
            description: 'Calculated floor price (costPrice * (1 + minMarginPercent/100))'
          },
          floorApplied: { type: 'boolean', description: 'Whether the floor was triggered' },
          waterfall: {
            type: 'array',
            description: 'Ordered list of every pricing step evaluated, with verdict and reason',
            items: {
              type: 'object',
              properties: {
                position: { type: 'integer', description: '1-based position in evaluation order' },
                profileId: { type: 'string', format: 'uuid' },
                profileName: { type: 'string' },
                customerName: { type: 'string' },
                tier: { type: 'integer', nullable: true },
                tierLabel: { type: 'string', nullable: true },
                scope: { type: 'string', enum: ['all', 'selected'] },
                adjustment: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['fixed', 'dynamic', 'custom'] },
                    direction: { type: 'string', enum: ['increase', 'decrease'], nullable: true },
                    value: { type: 'number', nullable: true }
                  }
                },
                computedPrice: { type: 'number' },
                priceAfterFloor: {
                  type: 'number',
                  nullable: true,
                  description: 'Set only on winning entry when floor was applied'
                },
                verdict: { type: 'string', enum: ['won', 'lost', 'rejected'] },
                reason: { type: 'string', description: 'Human-readable explanation of verdict' }
              }
            }
          },
          marginInsight: {
            type: 'object',
            description: 'Flags when winning price diverges >10% from same-tier average',
            properties: {
              triggered: { type: 'boolean' },
              winningPrice: { type: 'number' },
              sameTierAvgPrice: { type: 'number' },
              divergencePercent: { type: 'number' },
              message: { type: 'string', nullable: true }
            }
          }
        }
      }
    }
  }
};

export default swaggerConfig;
