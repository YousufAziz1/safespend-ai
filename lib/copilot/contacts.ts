/**
 * SafeSpend AI Copilot — Contact Memory Manager
 * Module CP-02, Part 2
 *
 * Stores contacts in localStorage for deterministic name → address resolution.
 */

import { PublicKey } from '@solana/web3.js';

const STORAGE_KEY = 'safespend_copilot_contacts';

export interface Contact {
    id: string;
    name: string;
    address: string;
    createdAt: string;
}

function generateId(): string {
    return `contact_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Retrieve all saved contacts from localStorage.
 */
export function getContacts(): Contact[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as Contact[]) : [];
    } catch {
        return [];
    }
}

function persistContacts(contacts: Contact[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

/**
 * Find a contact by name (case-insensitive).
 */
export function findContactByName(name: string): Contact | undefined {
    const lower = name.toLowerCase().trim();
    return getContacts().find((c) => c.name.toLowerCase() === lower);
}

/**
 * Validate that a string is a valid Solana public key.
 */
export function isValidSolanaAddress(address: string): boolean {
    try {
        const key = new PublicKey(address.trim());
        return PublicKey.isOnCurve(key.toBytes());
    } catch {
        return false;
    }
}

/**
 * Save a new contact. Returns the created Contact or null if invalid.
 */
export function saveContact(name: string, address: string): Contact | null {
    const trimmedAddress = address.trim();
    if (!isValidSolanaAddress(trimmedAddress)) return null;

    const existing = findContactByName(name);
    if (existing) {
        // Update the existing contact instead of duplicating
        return updateContact(existing.id, { address: trimmedAddress });
    }

    const contact: Contact = {
        id: generateId(),
        name: name.trim(),
        address: trimmedAddress,
        createdAt: new Date().toISOString(),
    };

    const contacts = getContacts();
    contacts.push(contact);
    persistContacts(contacts);
    return contact;
}

/**
 * Remove a contact by ID.
 */
export function removeContact(id: string): boolean {
    const contacts = getContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    if (filtered.length === contacts.length) return false;
    persistContacts(filtered);
    return true;
}

/**
 * Update a contact's fields. Returns the updated Contact or null.
 */
export function updateContact(id: string, updates: Partial<Pick<Contact, 'name' | 'address'>>): Contact | null {
    const contacts = getContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) return null;

    if (updates.name) contacts[index].name = updates.name.trim();
    if (updates.address) {
        if (!isValidSolanaAddress(updates.address)) return null;
        contacts[index].address = updates.address.trim();
    }

    persistContacts(contacts);
    return contacts[index];
}
