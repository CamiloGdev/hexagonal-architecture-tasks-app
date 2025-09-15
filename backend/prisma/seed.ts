import { PrismaClient, Priority } from '../src/generated/prisma/index.js';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Predefined data for software development company
const CATEGORIES = [
  'Desarrollo Web',
  'Desarrollo Móvil', 
  'Marketing Digital',
  'Ventas',
  'QA Testing',
  'DevOps',
  'UI/UX Design',
  'Backend Development',
  'Frontend Development',
  'Data Analytics'
];

const TAGS = [
  'Enviar Email',
  'Crear Reporte',
  'Historia de Usuario',
  'Bug Fix',
  'Code Review',
  'Documentación',
  'Testing',
  'Deploy',
  'Reunión Cliente',
  'Investigación',
  'Prototipo',
  'Refactoring',
  'Performance',
  'Seguridad',
  'API Integration'
];

const TAG_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9', // Light Blue
  '#F8C471', // Orange
  '#82E0AA'  // Light Green
];

const TASK_TEMPLATES = [
  'Implementar autenticación de usuarios',
  'Crear dashboard de métricas',
  'Optimizar consultas de base de datos',
  'Diseñar wireframes para nueva funcionalidad',
  'Escribir tests unitarios para módulo',
  'Configurar pipeline de CI/CD',
  'Revisar código de pull request',
  'Actualizar documentación técnica',
  'Investigar nueva tecnología',
  'Corregir bug en producción',
  'Crear prototipo de interfaz',
  'Integrar API externa',
  'Realizar análisis de performance',
  'Preparar presentación para cliente',
  'Configurar monitoreo de aplicación',
  'Migrar base de datos',
  'Implementar feature flag',
  'Crear componente reutilizable',
  'Optimizar bundle de JavaScript',
  'Configurar SSL certificado'
];

type UserWithId = {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  created_at: Date;
  updated_at: Date;
};

type CategoryWithId = {
  id: string;
  name: string;
  color: string | null;
  user_id: string;
  created_at: Date;
  updated_at: Date;
};

type TagWithId = {
  id: string;
  name: string;
  color: string | null;
  user_id: string;
  created_at: Date;
  updated_at: Date;
};

async function seedUsers() {
  console.log('🌱 Seeding users...');
  
  const users: UserWithId[] = [];
  
  for (let i = 1; i <= 3; i++) {
    const email = `user${i}@taskapp.com`;
    const password = `password${i}23!`; // Simple but meets validation requirements
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email,
        password_hash: passwordHash,
      },
    });
    
    users.push(user);
    console.log(`✅ Created user: ${user.email} (password: ${password})`);
  }
  
  return users;
}

async function seedCategories(users: UserWithId[]) {
  console.log('🌱 Seeding categories...');
  
  const createdCategories: CategoryWithId[] = [];
  
  for (const user of users) {
    const numCategories = faker.number.int({ min: 3, max: 6 });
    const userCategories = faker.helpers.arrayElements(CATEGORIES, numCategories);
    
    for (const categoryName of userCategories) {
      const category = await prisma.category.create({
        data: {
          name: categoryName,
          color: 'transparent', // As requested
          user_id: user.id,
        },
      });
      
      createdCategories.push(category);
    }
    
    console.log(`✅ Created ${numCategories} categories for user ${user.email}`);
  }
  
  return createdCategories;
}

async function seedTags(users: UserWithId[]) {
  console.log('🌱 Seeding tags...');
  
  const createdTags: TagWithId[] = [];
  
  for (const user of users) {
    const numTags = faker.number.int({ min: 5, max: 10 });
    const userTags = faker.helpers.arrayElements(TAGS, numTags);
    
    for (const tagName of userTags) {
      const randomColor = faker.helpers.arrayElement(TAG_COLORS);
      
      const tag = await prisma.tag.create({
        data: {
          name: tagName,
          color: randomColor,
          user_id: user.id,
        },
      });
      
      createdTags.push(tag);
    }
    
    console.log(`✅ Created ${numTags} tags for user ${user.email}`);
  }
  
  return createdTags;
}

async function seedTasks(users: UserWithId[], categories: CategoryWithId[], tags: TagWithId[]) {
  console.log('🌱 Seeding tasks...');
  
  for (const user of users) {
    const userCategories = categories.filter(cat => cat.user_id === user.id);
    const userTags = tags.filter(tag => tag.user_id === user.id);
    
    if (userCategories.length === 0) {
      console.log(`⚠️ No categories found for user ${user.email}, skipping tasks`);
      continue;
    }
    
    const numTasks = faker.number.int({ min: 10, max: 20 });
    
    for (let i = 0; i < numTasks; i++) {
      const randomCategory = faker.helpers.arrayElement(userCategories);
      const taskTemplate = faker.helpers.arrayElement(TASK_TEMPLATES);
      
      // Generate realistic task data
      const task = await prisma.task.create({
        data: {
          title: taskTemplate,
          description: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
          completed: faker.datatype.boolean(0.3), // 30% chance of being completed
          priority: faker.helpers.arrayElement([Priority.LOW, Priority.MEDIUM, Priority.HIGH]),
          due_date: faker.date.future(),
          completed_at: faker.datatype.boolean(0.3) ? faker.date.recent({ days: 7 }) : null,
          user_id: user.id,
          category_id: randomCategory.id,
        },
      });
      
      // Assign random tags to task (0-3 tags per task)
      if (userTags.length > 0) {
        const numTaskTags = faker.number.int({ min: 0, max: Math.min(3, userTags.length) });
        const taskTags = faker.helpers.arrayElements(userTags, numTaskTags);
        
        for (const tag of taskTags) {
          await prisma.taskTag.create({
            data: {
              task_id: task.id,
              tag_id: tag.id,
            },
          });
        }
      }
    }
    
    console.log(`✅ Created ${numTasks} tasks for user ${user.email}`);
  }
}

async function main() {
  console.log('🚀 Starting database seeding...');
  
  try {
    // Clear existing data in correct order (respecting foreign key constraints)
    await prisma.taskTag.deleteMany();
    await prisma.task.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('🧹 Cleared existing data');
    
    // Seed data in correct order
    const users = await seedUsers();
    const categories = await seedCategories(users);
    const tags = await seedTags(users);
    await seedTasks(users, categories, tags);
    
    console.log('✨ Database seeding completed successfully!');
    console.log('\n📋 Test Users Created:');
    console.log('Email: user1@taskapp.com | Password: password123!');
    console.log('Email: user2@taskapp.com | Password: password223!');
    console.log('Email: user3@taskapp.com | Password: password323!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
