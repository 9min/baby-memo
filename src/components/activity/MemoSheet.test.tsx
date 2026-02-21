import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MemoSheet from './MemoSheet'

describe('MemoSheet', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T10:30:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders title for new record', () => {
    render(
      <MemoSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('메모 기록')).toBeInTheDocument()
  })

  it('renders title for editing', () => {
    render(
      <MemoSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{
          metadata: { content: '컨디션 좋음' },
          recordedAt: new Date('2025-01-15T09:00:00'),
        }}
      />,
    )
    expect(screen.getByText('메모 수정')).toBeInTheDocument()
  })

  it('submit button is disabled when content is empty', () => {
    render(
      <MemoSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )
    expect(screen.getByText('기록하기')).toBeDisabled()
  })

  it('submit button is enabled when content is provided', () => {
    render(
      <MemoSheet open={true} onOpenChange={() => {}} onSubmit={() => {}} />,
    )

    const input = screen.getByPlaceholderText(/컨디션/)
    fireEvent.change(input, { target: { value: '체온 36.5도' } })
    expect(screen.getByText('기록하기')).not.toBeDisabled()
  })

  it('calls onSubmit with content and time', () => {
    const onSubmit = vi.fn()
    render(
      <MemoSheet open={true} onOpenChange={() => {}} onSubmit={onSubmit} />,
    )

    const input = screen.getByPlaceholderText(/컨디션/)
    fireEvent.change(input, { target: { value: '체온 36.5도' } })
    fireEvent.click(screen.getByText('기록하기'))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toEqual({ content: '체온 36.5도' })
  })

  it('loads initial data when editing', () => {
    render(
      <MemoSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{
          metadata: { content: '컨디션 좋음' },
          recordedAt: new Date('2025-01-15T09:00:00'),
        }}
      />,
    )

    const input = screen.getByPlaceholderText(/컨디션/) as HTMLInputElement
    expect(input.value).toBe('컨디션 좋음')
  })

  it('shows 수정하기 button when editing', () => {
    render(
      <MemoSheet
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        initialData={{
          metadata: { content: '컨디션 좋음' },
          recordedAt: new Date('2025-01-15T09:00:00'),
        }}
      />,
    )
    expect(screen.getByText('수정하기')).toBeInTheDocument()
  })
})
