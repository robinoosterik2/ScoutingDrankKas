https://nuxt.com/docs/guide/directory-structure/server#server-middleware


Adding modules is difficult you need to add them to the nuxt.config.js file. and sometimes they just do not work " Nuxt module should be a function" even when following their own documentation. Maybe it is because of certain versions of the modules.

For example: il8n module
when following the documentation I get this error:
ERROR  Cannot restart nuxt:  Nuxt module should be a function: @nuxtjs/i18n


Later on I found out that there are inconsistencies in the documentation:
https://nuxt.com/modules/i18n Says i need to install with npx nuxi@latest module add i18n
https://i18n.nuxtjs.org/docs/getting-started Says i need to install with npx nuxi@latest module add @nuxtjs/i18n@next

Both give the error Nuxt module should be a function: @nuxtjs/i18n.





Also sometimes it cannot find any nuxt variables that are auto imported.