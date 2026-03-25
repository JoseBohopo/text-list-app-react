import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddItemModal } from '../AddItemModal';
import { useListStore } from '../../../store/useListStore';
import { createRef } from 'react';

beforeEach(() => useListStore.setState({ items: [], focusedIndex: 0, history: [] }));

function setup(isOpen = true) {
  const triggerRef = createRef<HTMLButtonElement>();
  const onClose = vi.fn();
  render(
    <AddItemModal isOpen={isOpen} onClose={onClose} triggerRef={triggerRef} />
  );
  return { onClose };
}

describe('AddItemModal', () => {
  it('renders nothing when closed', () => {
    setup(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the form when open', () => {
    setup();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows error for empty submission', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('adds item and closes on valid submission', async () => {
    const { onClose } = setup();
    await userEvent.type(screen.getByPlaceholderText('New item...'), 'Buy milk');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(useListStore.getState().items[0].text).toBe('Buy milk');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes without adding on cancel', async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(useListStore.getState().items).toHaveLength(0);
  });

  it('clears error on input change', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('New item...'), 'x');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});