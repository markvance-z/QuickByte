import { render } from '@testing-library/react'
import Dashboard from '@/app/dashboard/page' 

it('renders homepage unchanged', () => {
  const { container } = render(<Dashboard/>)
  expect(container).toMatchSnapshot()
})