import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ResetPassword } from '@/routes/reset-password'

const auth=vi.hoisted(()=>({getSession:vi.fn(),getUser:vi.fn(),updateUser:vi.fn(),onAuthStateChange:vi.fn(),navigate:vi.fn()}))
vi.mock('@/integrations/supabase/client',()=>({supabase:{auth}}))
vi.mock('@tanstack/react-router',()=>({createFileRoute:()=> (options:unknown)=>options,useNavigate:()=>auth.navigate,Link:({children}: {children:React.ReactNode})=><a>{children}</a>}))
vi.mock('@/components/couture/site',()=>({pageHead:()=>({})}))

const session={user:{user_metadata:{must_change_password:true}}}
beforeEach(()=>{
 vi.clearAllMocks()
 auth.getSession.mockResolvedValue({data:{session},error:null})
 auth.getUser.mockResolvedValue({data:{user:session.user},error:null})
 auth.onAuthStateChange.mockReturnValue({data:{subscription:{unsubscribe:vi.fn()}}})
})
afterEach(()=>{cleanup();vi.useRealTimers()})
function fill(){
 fireEvent.change(screen.getByLabelText('Mot de passe actuel'),{target:{value:'test-current-only'}})
 fireEvent.change(screen.getByLabelText('Nouveau mot de passe'),{target:{value:'test-new-password-only'}})
 fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'),{target:{value:'test-new-password-only'}})
}
describe('Password session restoration',()=>{
 it('restores a forced-change form after remount and sends the current password',async()=>{
  auth.updateUser.mockResolvedValue({error:null})
  const first=render(<ResetPassword />)
  await screen.findByLabelText('Mot de passe actuel')
  first.unmount()
  render(<ResetPassword />)
  await screen.findByLabelText('Mot de passe actuel')
  fill()
  fireEvent.click(screen.getByRole('button',{name:'ENREGISTRER'}))
  await waitFor(()=>expect(auth.updateUser).toHaveBeenCalledWith({password:'test-new-password-only',current_password:'test-current-only',data:{must_change_password:false}}))
  await waitFor(()=>expect(auth.navigate).toHaveBeenCalledWith({to:'/admin'}))
 })
 it('accepts a session restored after the initial check',async()=>{
  auth.getSession.mockResolvedValue({data:{session:null},error:null})
  render(<ResetPassword />)
  await screen.findByText('Connexion administrateur')
  const callback=auth.onAuthStateChange.mock.calls[0]?.[0]
  if(!callback)throw new Error('Auth listener was not registered')
  act(()=>callback('SIGNED_IN',session))
  expect(screen.getByLabelText('Mot de passe actuel')).toBeEnabled()
 })
 it('offers retry when restoration stalls',async()=>{
  vi.useFakeTimers()
  auth.getSession.mockReturnValue(new Promise(()=>{}))
  render(<ResetPassword />)
  act(()=>vi.advanceTimersByTime(10000))
  expect(screen.getByRole('button',{name:'RÉESSAYER'})).toBeEnabled()
  fireEvent.click(screen.getByRole('button',{name:'RÉESSAYER'}))
  expect(auth.getSession).toHaveBeenCalledTimes(2)
 })
 it('re-enables saving after a failed network request',async()=>{
  auth.updateUser.mockRejectedValue(new Error('network failure'))
  render(<ResetPassword />)
  await screen.findByLabelText('Mot de passe actuel')
  fill()
  fireEvent.click(screen.getByRole('button',{name:'ENREGISTRER'}))
  await screen.findByRole('alert')
  expect(screen.getByRole('button',{name:'ENREGISTRER'})).toBeEnabled()
  expect(auth.navigate).not.toHaveBeenCalled()
 })
})