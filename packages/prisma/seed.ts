import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SARWA database...');

  // ── USERS ───────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('admin123', 10);
  const customerPass = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sarwa.in' },
    update: {},
    create: {
      email: 'admin@sarwa.in',
      password: adminPass,
      firstName: 'SARWA',
      lastName: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'demo@sarwa.in' },
    update: {},
    create: {
      email: 'demo@sarwa.in',
      password: customerPass,
      firstName: 'Aanya',
      lastName: 'Sharma',
      role: 'CUSTOMER',
      emailVerified: true,
    },
  });

  console.log('Users:', admin.email);

  // ── CATEGORIES (nested) ────────────────────────────────────────────
  const sarees = await prisma.category.upsert({
    where: { slug: 'sarees' },
    update: {},
    create: {
      name: 'Sarees',
      slug: 'sarees',
      description: 'Handpicked sarees for every occasion.',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
      sortOrder: 1,
    },
  });

  const jewellery = await prisma.category.upsert({
    where: { slug: 'jewellery' },
    update: {},
    create: {
      name: 'Jewellery',
      slug: 'jewellery',
      description: 'Heritage and contemporary jewellery.',
      image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800',
      sortOrder: 2,
    },
  });

  const byFabric = await prisma.category.create({
    data: {
      name: 'By Fabric',
      slug: 'by-fabric',
      parentId: sarees.id,
      sortOrder: 1,
    },
  });
  await prisma.category.createMany({
    data: ['Silk', 'Cotton', 'Linen', 'Chiffon', 'Georgette', 'Organza'].map((name, i) => ({
      name,
      slug: name.toLowerCase(),
      parentId: byFabric.id,
      sortOrder: i,
    })),
  });

  const byOccasion = await prisma.category.create({
    data: {
      name: 'By Occasion',
      slug: 'by-occasion',
      parentId: sarees.id,
      sortOrder: 2,
    },
  });
  await prisma.category.createMany({
    data: ['Wedding', 'Office', 'Festive'].map((name, i) => ({
      name,
      slug: name.toLowerCase(),
      parentId: byOccasion.id,
      sortOrder: i,
    })),
  });

  const byBudget = await prisma.category.create({
    data: {
      name: 'By Budget',
      slug: 'by-budget',
      parentId: sarees.id,
      sortOrder: 3,
    },
  });
  await prisma.category.createMany({
    data: [
      { name: 'Below 1000', slug: 'below-1000' },
      { name: '1000-3000', slug: '1000-3000' },
      { name: 'Above 3000', slug: 'above-3000' },
    ].map((c, i) => ({ ...c, parentId: byBudget.id, sortOrder: i })),
  });

  const jewelleryParent = await prisma.category.create({
    data: {
      name: 'By Type',
      slug: 'by-type',
      parentId: jewellery.id,
      sortOrder: 1,
    },
  });
  await prisma.category.createMany({
    data: [
      { name: 'Necklace', slug: 'necklace' },
      { name: 'Earrings', slug: 'earrings' },
      { name: 'Bangles', slug: 'bangles' },
      { name: 'Rings', slug: 'rings' },
    ].map((c, i) => ({ ...c, parentId: jewelleryParent.id, sortOrder: i })),
  });

  const temple = await prisma.category.create({
    data: {
      name: 'Temple Jewellery',
      slug: 'temple-jewellery',
      parentId: jewelleryParent.id,
      sortOrder: 0,
    },
  });

  // ── COLLECTIONS ─────────────────────────────────────────────────────
  const collectionsData = [
    { name: 'Featured Sarees', slug: 'featured-sarees', type: 'FEATURED' },
    { name: 'Wedding Edit', slug: 'wedding-edit', type: 'WEDDING' },
    { name: 'Silk Collection', slug: 'silk-collection', type: 'SILK' },
    { name: 'Daily Wear', slug: 'daily-wear', type: 'DAILY' },
    { name: 'Office Wear', slug: 'office-wear', type: 'OFFICE' },
    { name: 'Party Wear', slug: 'party-wear', type: 'PARTY' },
    { name: 'Designer Edit', slug: 'designer-edit', type: 'DESIGNER' },
    { name: 'Heritage Jewellery', slug: 'jewellery-collection', type: 'JEWELLERY' },
  ];
  for (const c of collectionsData) {
    await prisma.collection.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, isActive: true },
    });
  }

  // ── PRODUCTS ────────────────────────────────────────────────────────
  const productsData = [
    {
      name: 'Anaya Banarasi Silk Saree',
      slug: 'anaya-banarasi-silk',
      sku: 'SAR-SAR-001',
      price: 12999,
      offerPrice: 9999,
      fabric: 'Silk',
      occasion: 'Wedding',
      color: 'Maroon',
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900'],
      collection: ['featured-sarees', 'wedding-edit', 'silk-collection'],
      isFeatured: true,
      isBestSeller: true,
      tags: ['Banarasi', 'Bridal', 'Heavy'],
    },
    {
      name: 'Meera Chanderi Cotton Saree',
      slug: 'meera-chanderi-cotton',
      sku: 'SAR-SAR-002',
      price: 4999,
      offerPrice: 3499,
      fabric: 'Cotton',
      occasion: 'Office',
      color: 'Beige',
      images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900'],
      collection: ['daily-wear', 'office-wear'],
      isTrending: true,
      isNewArrival: true,
      tags: ['Chanderi', 'Lightweight'],
    },
    {
      name: 'Vanya Kanjivaram Silk Saree',
      slug: 'vanya-kanjivaram-silk',
      sku: 'SAR-SAR-003',
      price: 18999,
      offerPrice: 15999,
      fabric: 'Silk',
      occasion: 'Wedding',
      color: 'Red',
      images: ['https://images.unsplash.com/photo-1610189000263-c3eb18f8dad2?w=900'],
      collection: ['wedding-edit', 'silk-collection'],
      isFeatured: true,
      tags: ['Kanjivaram', 'Pure Silk'],
    },
    {
      name: 'Isha Linen Saree',
      slug: 'isha-linen-saree',
      sku: 'SAR-SAR-004',
      price: 5999,
      offerPrice: 4499,
      fabric: 'Linen',
      occasion: 'Office',
      color: 'Pastel',
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900'],
      collection: ['office-wear', 'daily-wear'],
      isNewArrival: true,
      tags: ['Linen', 'Minimal'],
    },
    {
      name: 'Riya Organza Party Saree',
      slug: 'riya-organza-party',
      sku: 'SAR-SAR-005',
      price: 8499,
      offerPrice: 6999,
      fabric: 'Organza',
      occasion: 'Party',
      color: 'Pink',
      images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900'],
      collection: ['party-wear', 'featured-sarees'],
      isTrending: true,
      tags: ['Organza', 'Cocktail'],
    },
    {
      name: 'Tara Designer Chiffon Saree',
      slug: 'tara-designer-chiffon',
      sku: 'SAR-SAR-006',
      price: 9999,
      offerPrice: 7999,
      fabric: 'Chiffon',
      occasion: 'Party',
      color: 'Gold',
      images: ['https://images.unsplash.com/photo-1610189000263-c3eb18f8dad2?w=900'],
      collection: ['designer-edit', 'party-wear'],
      isFeatured: true,
      tags: ['Designer', 'Embellished'],
    },
    {
      name: 'Maya Temple Necklace Set',
      slug: 'maya-temple-necklace',
      sku: 'SAR-JWL-001',
      price: 7999,
      offerPrice: 5999,
      fabric: null,
      occasion: 'Wedding',
      color: 'Gold',
      images: ['https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=900'],
      collection: ['jewellery-collection', 'wedding-edit'],
      isBestSeller: true,
      tags: ['Temple', 'Heritage'],
      categories: ['temple-jewellery'],
    },
    {
      name: 'Kavya Jhumka Earrings',
      slug: 'kavya-jhumka-earrings',
      sku: 'SAR-JWL-002',
      price: 2499,
      offerPrice: 1799,
      fabric: null,
      occasion: 'Festive',
      color: 'Gold',
      images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900'],
      collection: ['jewellery-collection'],
      isNewArrival: true,
      tags: ['Jhumka', 'Traditional'],
      categories: ['earrings'],
    },
  ];

  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        shortDescription: `${p.fabric ?? 'Heritage'} ${p.occasion ?? ''}`.trim(),
        description: `Discover the elegance of the ${p.name}. Meticulously curated, this piece blends heritage craftsmanship with modern aesthetics for the contemporary Indian woman.`,
        price: p.price,
        offerPrice: p.offerPrice ?? null,
        stock: 25,
        fabric: p.fabric ?? undefined,
        occasion: p.occasion ?? undefined,
        color: p.color ?? undefined,
        tagsJson: JSON.stringify(p.tags),
        isFeatured: !!p.isFeatured,
        isTrending: !!p.isTrending,
        isNewArrival: !!p.isNewArrival,
        isBestSeller: !!p.isBestSeller,
        isActive: true,
      },
    });

    // images
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: p.images.map((url, i) => ({
        productId: product.id,
        url,
        sortOrder: i,
      })),
    });

    // categories
    if (p.categories) {
      await prisma.productOnCategory.deleteMany({ where: { productId: product.id } });
      for (const slug of p.categories) {
        const cat = await prisma.category.findUnique({ where: { slug } });
        if (cat) {
          await prisma.productOnCategory.create({
            data: { productId: product.id, categoryId: cat.id },
          });
        }
      }
    } else {
      const sareeCat = await prisma.category.findUnique({ where: { slug: 'sarees' } });
      if (sareeCat) {
        await prisma.productOnCategory.upsert({
          where: { productId_categoryId: { productId: product.id, categoryId: sareeCat.id } },
          update: {},
          create: { productId: product.id, categoryId: sareeCat.id },
        });
      }
    }

    // collections
    if (p.collection) {
      await prisma.productOnCollection.deleteMany({ where: { productId: product.id } });
      for (const slug of p.collection) {
        const col = await prisma.collection.findUnique({ where: { slug } });
        if (col) {
          await prisma.productOnCollection.create({
            data: { productId: product.id, collectionId: col.id },
          });
        }
      }
    }
  }

  // ── HERO BANNERS ────────────────────────────────────────────────────
  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      {
        position: 'HERO',
        desktopImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920',
        mobileImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=750',
        heading: 'The Bridal Edit',
        subHeading: 'Handwoven sarees for your forever',
        buttonText: 'Shop the Edit',
        buttonLink: '/collections/wedding-edit',
        displayOrder: 1,
        isActive: true,
      },
      {
        position: 'HERO',
        desktopImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920',
        mobileImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=750',
        heading: 'Silk Heritage',
        subHeading: 'Curated Banarasi & Kanjivaram',
        buttonText: 'Explore Silks',
        buttonLink: '/collections/silk-collection',
        displayOrder: 2,
        isActive: true,
      },
      {
        position: 'HERO',
        desktopImage: 'https://images.unsplash.com/photo-1610189000263-c3eb18f8dad2?w=1920',
        mobileImage: 'https://images.unsplash.com/photo-1610189000263-c3eb18f8dad2?w=750',
        heading: 'Heritage Jewellery',
        subHeading: 'Temple-finished pieces, modern soul',
        buttonText: 'Shop Jewellery',
        buttonLink: '/collections/jewellery-collection',
        displayOrder: 3,
        isActive: true,
      },
    ],
  });

  // ── MENU (mega menu builder seed) ───────────────────────────────────
  await prisma.menuItem.deleteMany({});
  const sareeMenu = await prisma.menuItem.create({
    data: { label: 'Sarees', link: '/shop/sarees', sortOrder: 1, isActive: true },
  });
  const fabricMenu = await prisma.menuItem.create({
    data: { label: 'By Fabric', parentId: sareeMenu.id, sortOrder: 1, isActive: true },
  });
  const occasionMenu = await prisma.menuItem.create({
    data: { label: 'By Occasion', parentId: sareeMenu.id, sortOrder: 2, isActive: true },
  });
  const budgetMenu = await prisma.menuItem.create({
    data: { label: 'By Budget', parentId: sareeMenu.id, sortOrder: 3, isActive: true },
  });

  const sareeByFabric = await prisma.category.findFirst({ where: { slug: 'by-fabric' } });
  if (sareeByFabric) {
    const fabrics = ['silk', 'cotton', 'linen', 'chiffon', 'georgette', 'organza'];
    for (const slug of fabrics) {
      const cat = await prisma.category.findUnique({ where: { slug } });
      if (!cat) continue;
      await prisma.menuItem.create({
        data: {
          label: cat.name,
          link: `/shop/${cat.slug}`,
          parentId: fabricMenu.id,
          categorySlug: cat.slug,
          sortOrder: fabrics.indexOf(slug),
          isActive: true,
        },
      });
    }
  }

  const sareeByOccasion = await prisma.category.findFirst({ where: { slug: 'by-occasion' } });
  if (sareeByOccasion) {
    for (const slug of ['wedding', 'office', 'festive']) {
      const cat = await prisma.category.findUnique({ where: { slug } });
      if (!cat) continue;
      await prisma.menuItem.create({
        data: {
          label: cat.name,
          link: `/shop/${cat.slug}`,
          parentId: occasionMenu.id,
          categorySlug: cat.slug,
          sortOrder: ['wedding', 'office', 'festive'].indexOf(slug),
          isActive: true,
        },
      });
    }
  }

  const sareeByBudget = await prisma.category.findFirst({ where: { slug: 'by-budget' } });
  if (sareeByBudget) {
    for (const slug of ['below-1000', '1000-3000', 'above-3000']) {
      const cat = await prisma.category.findUnique({ where: { slug } });
      if (!cat) continue;
      await prisma.menuItem.create({
        data: {
          label: cat.name,
          link: `/shop/${cat.slug}`,
          parentId: budgetMenu.id,
          categorySlug: cat.slug,
          sortOrder: ['below-1000', '1000-3000', 'above-3000'].indexOf(slug),
          isActive: true,
        },
      });
    }
  }

  const jwMenu = await prisma.menuItem.create({
    data: { label: 'Jewellery', link: '/shop/jewellery', sortOrder: 2, isActive: true },
  });

  const jwByType = await prisma.category.findFirst({ where: { slug: 'by-type' } });
  if (jwByType) {
    for (const slug of ['necklace', 'earrings', 'bangles', 'rings']) {
      const cat = await prisma.category.findUnique({ where: { slug } });
      if (!cat) continue;
      await prisma.menuItem.create({
        data: {
          label: cat.name,
          link: `/shop/${cat.slug}`,
          parentId: jwMenu.id,
          categorySlug: cat.slug,
          sortOrder: ['necklace', 'earrings', 'bangles', 'rings'].indexOf(slug),
          isActive: true,
        },
      });
    }
  }

  const templeM = await prisma.menuItem.create({
    data: { label: 'Temple Jewellery', parentId: jwMenu.id, sortOrder: 0, isActive: true, categorySlug: temple.slug, link: '/shop/temple-jewellery' },
  });

  const newArrivals = await prisma.menuItem.create({
    data: { label: 'New Arrivals', link: '/shop?filter=new-arrivals', sortOrder: 3, isActive: true },
  });
  await prisma.menuItem.create({
    data: { label: 'Bridal Edit', link: '/collections/wedding-edit', sortOrder: 4, isActive: true },
  });
  await prisma.menuItem.create({
    data: { label: 'About SARWA', link: '/about', sortOrder: 5, isActive: true },
  });

  // ── COUPON ───────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      minPurchase: 2000,
      usageLimit: 1000,
      perCustomerLimit: 1,
      active: true,
    },
  });

  // ── CMS PAGES ────────────────────────────────────────────────────────
  const pages = [
    { slug: 'about', title: 'About SARWA', content: '<p>SARWA is a celebration of Indian craftsmanship and contemporary elegance.</p>' },
    { slug: 'contact', title: 'Contact', content: '<p>Reach us at hello@sarwa.in</p>' },
    { slug: 'privacy', title: 'Privacy Policy', content: '<p>Your privacy matters.</p>' },
    { slug: 'terms', title: 'Terms of Service', content: '<p>Terms governing your use of SARWA.</p>' },
    { slug: 'return-policy', title: 'Return Policy', content: '<p>7-day return on unused products.</p>' },
    { slug: 'shipping-policy', title: 'Shipping Policy', content: '<p>Free shipping on orders above ₹1500.</p>' },
    { slug: 'faq', title: 'FAQ', content: '<p>Common questions answered.</p>' },
  ];
  for (const page of pages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: { ...page, isPublished: true },
    });
  }

  // ── REVIEWS ─────────────────────────────────────────────────────────
  await prisma.review.deleteMany({});
  const sampleProducts = await prisma.product.findMany({ take: 4 });
  for (const [i, product] of sampleProducts.entries()) {
    await prisma.review.create({
      data: {
        productId: product.id,
        userName: ['Aanya S.', 'Priya R.', 'Meera K.', 'Riya T.'][i],
        rating: [5, 4, 5, 5][i],
        title: 'Stunning craftsmanship',
        comment: 'The fabric, the fall, the colours — everything feels intentional. Worth every rupee.',
        status: 'APPROVED',
      },
    });
  }

  console.log('SARWA seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
