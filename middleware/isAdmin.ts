import {defineNuxtMiddleware} from '@nuxtjs/composition-api';

export default defineNuxtMiddleware(({store, redirect}) => {
  if (!store.state.employee.isAdmin) {
    return redirect('/');
  }
});
