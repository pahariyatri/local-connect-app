import base from './playwright.config'; import { defineConfig } from '@playwright/test';
export default defineConfig({ ...base, reporter:[['list']], retries:0, use:{...base.use, channel:'chrome'}, projects: base.projects!.map(p=>({...p,use:{...p.use,channel:'chrome'}})) });
