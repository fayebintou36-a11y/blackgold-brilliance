import { describe,it,expect } from 'vitest'
import { assertAdminRoles,collectionInput,pageContentInput,imageUrlSchema } from '@/lib/admin-schema'
describe('Administration rules',()=>{
 it('requires an admin role',()=>{expect(()=>assertAdminRoles(['user'])).toThrow();expect(()=>assertAdminRoles(['moderator'])).toThrow();expect(()=>assertAdminRoles(['admin'])).not.toThrow()})
 it('requires a collection name of at least two characters',()=>{expect(collectionInput.safeParse({name:'A'}).success).toBe(false);expect(collectionInput.safeParse({name:'AB'}).success).toBe(true)})
 it('rejects unsafe image addresses',()=>{expect(imageUrlSchema.safeParse('javascript:alert(1)').success).toBe(false);expect(imageUrlSchema.safeParse('https://example.com/photo.jpg').success).toBe(true)})
 it('restricts content to public pages',()=>{expect(pageContentInput.safeParse({page:'admin',section:'titre',content:'x'}).success).toBe(false);expect(pageContentInput.safeParse({page:'accueil',section:'titre',content:'x'}).success).toBe(true)})
})