import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/Sidebar'

describe('Sidebar', () => {
  it('renders all topic labels', () => {
    render(<Sidebar onNewChat={() => {}} />)
    expect(screen.getByText(/Scripture/)).toBeInTheDocument()
    expect(screen.getByText(/Soteriology/)).toBeInTheDocument()
    expect(screen.getByText(/Christology/)).toBeInTheDocument()
    expect(screen.getByText(/Ecclesiology/)).toBeInTheDocument()
    expect(screen.getByText(/Holy Spirit/)).toBeInTheDocument()
    expect(screen.getByText(/Last Things/)).toBeInTheDocument()
  })

  it('renders New Chat button', () => {
    render(<Sidebar onNewChat={() => {}} />)
    expect(screen.getByText('+ New Chat')).toBeInTheDocument()
  })

  it('calls onNewChat when New Chat is clicked', () => {
    const onNewChat = jest.fn()
    render(<Sidebar onNewChat={onNewChat} />)
    fireEvent.click(screen.getByText('+ New Chat'))
    expect(onNewChat).toHaveBeenCalledTimes(1)
  })
})
