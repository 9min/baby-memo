import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActivityButton from './ActivityButton'
import { ACTIVITY_CONFIGS } from '@/lib/activityConfig'

describe('ActivityButton', () => {
  const solidFoodConfig = ACTIVITY_CONFIGS.solid_food

  it('renders activity label', () => {
    render(<ActivityButton config={solidFoodConfig} onClick={() => {}} />)
    expect(screen.getByText('먹어요')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<ActivityButton config={solidFoodConfig} onClick={onClick} />)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies bgColor from config', () => {
    render(<ActivityButton config={solidFoodConfig} onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-amber-50')
  })

  it('applies textColor from config', () => {
    render(<ActivityButton config={solidFoodConfig} onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('text-amber-600')
  })

  it('renders different labels for different activity types', () => {
    const { rerender } = render(
      <ActivityButton config={ACTIVITY_CONFIGS.drink} onClick={() => {}} />,
    )
    expect(screen.getByText('마셔요')).toBeInTheDocument()

    rerender(<ActivityButton config={ACTIVITY_CONFIGS.diaper} onClick={() => {}} />)
    expect(screen.getByText('기저귀')).toBeInTheDocument()
  })
})
