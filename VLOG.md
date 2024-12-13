https://nuxt.com/docs/guide/directory-structure/server#server-middleware


Adding modules is difficult you need to add them to the nuxt.config.js file. and sometimes they just do not work " Nuxt module should be a function" even when following their own documentation. Maybe it is because of certain versions of the modules.

For example: il8n module
when following the documentation I get this error:
ERROR  Cannot restart nuxt:  Nuxt module should be a function: @nuxtjs/i18n


Later on I found out that there are inconsistencies in the documentation:
https://nuxt.com/modules/i18n Says i need to install with npx nuxi@latest module add i18n
https://i18n.nuxtjs.org/docs/getting-started Says i need to install with npx nuxi@latest module add @nuxtjs/i18n@next

Both give the error Nuxt module should be a function: @nuxtjs/i18n.

The problem was my .nuxt folder was empty. When I tried to do npm install it said I missed permissions (this could have been bcs docker volume). I fixed the permissions with chmod and installed everything.

After installing I added the module again with npx "nuxi@latest module add @nuxtjs/i18n@next"

This is not the first time something like this happened. But I couldn't fix it before, I hope now when it happens again the "Nuxt module shoud be a function" I can fix it with the same steps.



A lot of times with nuxt I get stuck on none descriptive errors, this made it a lot difficult to debug. But slowly with a lot of errors I am figuring out how to use Nuxt and what to avoid.

Okay I try to add nuxt-lucide-icons and got the same error.
I deleted .nuxt and node_modules and reinstalled everything. Sadly It didn't work, I have no idea why it worked before with i18n and not with lucide-icons. But when trying to type it in vscode I do see lucide-icons in the auto import.

I guess I am not using lucide-icons till I figure out why it is not working.

Also sometimes it cannot find any nuxt variables that are auto imported.