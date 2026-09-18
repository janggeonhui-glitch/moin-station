import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StationCombobox } from './StationCombobox';

describe('StationCombobox', () => {
  it('초성으로 검색하고 키보드로 선택한다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StationCombobox id="station" value={null} onChange={onChange} />);

    const input = screen.getByRole('combobox');
    await user.type(input, 'ㅍㄱ');

    expect(input).toHaveAttribute('aria-expanded', 'true');
    const [first] = screen.getAllByRole('option');
    expect(first).toHaveTextContent('판교역');
    expect(input).toHaveAttribute('aria-activedescendant', first!.id);

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('판교');
    expect(input).toHaveValue('판교역');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('화살표로 활성 옵션을 옮긴다', async () => {
    const user = userEvent.setup();
    render(<StationCombobox id="station" value={null} onChange={vi.fn()} />);

    await user.type(screen.getByRole('combobox'), '강남');
    await user.keyboard('{ArrowDown}');

    const options = screen.getAllByRole('option');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
  });

  it('Escape로 목록을 닫는다', async () => {
    const user = userEvent.setup();
    render(<StationCombobox id="station" value={null} onChange={vi.fn()} />);

    const input = screen.getByRole('combobox');
    await user.type(input, '강남');
    await user.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('결과가 없으면 안내 문구를 보여준다', async () => {
    const user = userEvent.setup();
    render(<StationCombobox id="station" value={null} onChange={vi.fn()} />);

    await user.type(screen.getByRole('combobox'), '없는동네');
    expect(screen.getByRole('status')).toHaveTextContent('찾지 못했어요');
  });
});
