'use server';
import { revalidatePath } from 'next/cache';

export async function revalidateDash() {
  revalidatePath('/(main)', 'layout');
}
