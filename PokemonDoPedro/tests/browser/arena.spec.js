import { test, expect } from '@playwright/test';

test('batalha completa, WebGL, histórico, ranking e persistência', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /O desafio/ })).toBeVisible();
    await page.getByRole('button', { name: /Iniciar batalha/ }).click();
    await expect(page.locator('.pokemon-card')).toHaveCount(20);
    await page.locator('[data-pokemon="garchomp"]').click();
    await page.locator('[data-pokemon="garganacl"]').click();
    await expect(page.locator('.preview')).toHaveCount(2);
    await page.getByRole('button', { name: /Iniciar confronto/ }).click();
    await expect(page.locator('#arena canvas')).toBeVisible();
    for (let i = 0; i < 200 && !await page.locator('.victory').count(); i++) {
        await page.locator('[data-side="0"][data-move="earthquake"]').click();
        await page.locator('#execute-turn').click();
        await expect(page.locator('.header button').first()).toBeEnabled();
    }
    await expect(page.locator('.victory')).toBeVisible();
    await page.locator('.victory [data-action="ranking"]').click();
    await expect(page.locator('tbody tr')).toHaveCount(20);
    await expect(page.locator('tbody tr').first()).toContainText('Garchomp');
    await page.reload();
    await page.locator('.header [data-action="history"]').click();
    await expect(page.locator('.history-entry')).toHaveCount(1);
    await page.locator('.history-entry summary').click();
    await expect(page.locator('.history-body')).toContainText('Golpe decisivo');
    await page.screenshot({ path: 'test-results/history-desktop.png', fullPage: true });
    expect(errors).toEqual([]);
});

test('modo estratégico e campeonato de quatro participantes até campeão', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.getByRole('button', { name: /Campeonato/ }).click();
    await page.locator('#mode').selectOption('strategic');
    for (const id of ['garchomp', 'garganacl', 'dragonite', 'kingambit']) await page.locator(`[data-pokemon="${id}"]`).click();
    await page.getByRole('button', { name: /Iniciar campeonato/ }).click();
    await expect(page.locator('.bracket-match')).toHaveCount(3);
    await page.getByRole('button', { name: /Jogar confronto pendente/ }).click();
    for (let match = 0; match < 3; match++) {
        for (let turn = 0; turn < 200 && !await page.locator('.victory').count(); turn++) {
            await expect(page.locator('.header button').first()).toBeEnabled();
            for (const side of [0, 1]) {
                const buttons = page.locator(`.move-button[data-side="${side}"]:enabled`);
                await expect(buttons.first()).toBeVisible();
                // Alterna entre os golpes disponíveis para evitar imunidade persistente.
                await buttons.nth(turn % await buttons.count()).click();
            }
            await page.locator('#execute-turn').click();
            await expect(page.locator('.header button').first()).toBeEnabled();
        }
        await expect(page.locator('.victory')).toBeVisible();
        if (match < 2) await page.getByRole('button', { name: /Próximo confronto/ }).click();
    }
    await expect(page.locator('.victory')).toContainText('CAMPEÃO SUPREMO');
    await page.locator('.victory [data-action="bracket"]').click();
    await expect(page.locator('.supreme')).toBeVisible();
    expect(errors).toEqual([]);
});

test('celular, seleção, opções e ausência de rolagem horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.getByRole('button', { name: /Iniciar batalha/ }).click();
    await page.locator('[data-pokemon="dragonite"]').click();
    await page.locator('[data-pokemon="garchomp"]').click();
    const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => `${el.tagName}.${el.className}`).slice(0, 12));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), JSON.stringify(overflow)).toBeTruthy();
    await page.screenshot({ path: 'test-results/selection-mobile.png', fullPage: true });
    await page.getByRole('button', { name: /Iniciar confronto/ }).click();
    await expect(page.locator('#arena canvas')).toBeVisible();
    await page.screenshot({ path: 'test-results/arena-mobile.png', fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test('animações de ataque executam e devolvem os controles', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.getByRole('button', { name: /Iniciar batalha/ }).click();
    await page.locator('[data-pokemon="dragonite"]').click();
    await page.locator('[data-pokemon="garchomp"]').click();
    await page.getByRole('button', { name: /Iniciar confronto/ }).click();
    await page.locator('[data-side="0"][data-move="dragonclaw"]').click();
    await expect(page.locator('#arena')).toHaveAttribute('data-ready', 'true');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.screenshot({ path: 'test-results/arena-desktop.png', fullPage: true });
    await page.locator('#execute-turn').click();
    await expect(page.locator('.header button').first()).toBeEnabled({ timeout: 15000 });
    await expect(page.locator('#log')).toContainText('usou');
    expect(errors).toEqual([]);
});

test('fallback sem WebGL mantém batalha jogável', async ({ page }) => {
    await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) {
            if (String(type).includes('webgl')) return null;
            return original.call(this, type, ...args);
        };
    });
    await page.goto('/');
    await page.getByRole('button', { name: /Iniciar batalha/ }).click();
    await page.locator('[data-pokemon="dragonite"]').click();
    await page.locator('[data-pokemon="garchomp"]').click();
    await page.getByRole('button', { name: /Iniciar confronto/ }).click();
    await expect(page.locator('.fallback-fighters img')).toHaveCount(2);
    await page.locator('[data-side="0"][data-move="dragonclaw"]').click();
    await page.locator('#execute-turn').click();
    await expect(page.locator('#log')).toContainText('usou');
});
