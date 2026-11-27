import { randomUUID } from 'node:crypto';
import process from 'node:process';
import { expect, test } from '@playwright/test';

const mailpit = `http://127.0.0.1:${process.env.E2E_MAILPIT_PORT || '18025'}`;

test('home shows the five chosen products in curated order', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Top rated' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('heading', { level: 3 })).toHaveText([
    'Silver Ring',
    'Travel Backpack',
    'Pocket Speaker',
    'Rain Jacket',
    'Canvas Tote',
  ]);
});

test('a category link opens its top-rated and additional products', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Categories' })
    .getByRole('link', {
      name: 'Electronics',
    })
    .click();
  await expect(page.getByRole('heading', { name: 'Electronics', level: 1 })).toBeVisible();

  const topRated = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Top rated', exact: true }),
  });
  const more = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'More in Electronics', exact: true }),
  });

  await expect(topRated.getByRole('heading', { level: 3 })).toHaveText([
    'Pocket Speaker',
    'Studio Headphones',
    'Desk Charger',
  ]);
  await expect(more.getByRole('heading', { level: 3 })).toHaveText(['USB Cable']);
});

test('submitting search shows only products with matching text', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search products' }).fill('TRAVEL');
  await expect(page.getByRole('heading', { name: 'Discover our catalogue' })).toBeVisible();
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Results for “TRAVEL”' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('heading', { level: 3 })).toHaveText([
    'Pocket Speaker',
    'Travel Backpack',
  ]);

  await page.getByRole('searchbox', { name: 'Search products' }).fill('electronics');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Results for “electronics”' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('heading', { level: 3 })).toHaveText([
    'Pocket Speaker',
    'Studio Headphones',
    'Desk Charger',
    'USB Cable',
  ]);
});

test('selecting a product tile opens the details and loads its proxied image', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /^Pocket Speaker\b/ }).click();
  await expect(page.getByRole('heading', { name: 'Pocket Speaker', level: 1 })).toBeVisible();
  await expect(page.getByText('A compact speaker for travel.')).toBeVisible();
  await expect(page.getByText('$29.99', { exact: true })).toBeVisible();

  const image = page.getByRole('img', { name: 'Pocket Speaker' });
  await expect(image).toHaveAttribute('src', '/api/v1/products/1/image');
  await expect
    .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
    .toBeGreaterThan(0);
});

test('submitting an enquiry shows a thank-you message and emails sales', async ({
  page,
  request,
}) => {
  const reference = randomUUID();
  const email = `shopper-${reference}@example.test`;
  const message = `Is the Pocket Speaker available? Reference ${reference}`;

  await page.goto('/');
  await page.getByRole('link', { name: /^Pocket Speaker\b/ }).click();
  await page.getByRole('link', { name: 'Enquire', exact: true }).click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Sam Reviewer');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(email);
  await page.getByRole('textbox', { name: 'Message (optional)' }).fill(message);
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByRole('heading', { name: 'Thank you' })).toBeVisible();

  const inbox = new URL('/api/v1/search', mailpit);
  inbox.searchParams.set('query', `"${reference}"`);
  await expect
    .poll(async () => {
      const result = await request.get(inbox.toString());
      await expect(result).toBeOK();
      return (await result.json()).messages;
    })
    .toMatchObject([
      {
        Subject: 'New enquiry: Pocket Speaker',
        To: [{ Address: 'sales@catalogue.test' }],
        ReplyTo: [{ Address: email }],
        Snippet: expect.stringContaining('Sam Reviewer'),
      },
    ]);
});
