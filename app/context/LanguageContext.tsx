import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'pt' | 'en' | 'es';

interface LanguageContextData {
  language: Language;
  setAppLanguage: (lang: Language) => Promise<void>;
  translations: Record<string, string>;
}

const LanguageContext = createContext<LanguageContextData>({} as LanguageContextData);

const translations = {
  pt: {
    // Common
    error: 'Erro',
    success: 'Sucesso',
    save: 'Salvar',
    cancel: 'Cancelar',
    close: 'Fechar',
    fillAllFields: 'Por favor, preencha todos os campos',
    ok: 'OK',
    home: 'Início',
    location: 'Mapa',
    locationMessage: 'Veja todas as empresas próximas no mapa',
    watchedCompanies: 'Lista de empresas observadas',
    saved: 'Guardadas',
    send: 'Enviar',
    recentlyViewed: 'Vistos recentemente',
    supportService: 'Serviço de apoio',
    userEmail: 'Email', // Renomeando para evitar duplicação
    
    // Languages
    portuguese: 'Português',
    english: 'Inglês',
    spanish: 'Espanhol',
    
    // EdPerfil
    editProfile: 'Editar Perfil',
    changePicture: 'Alterar Foto de Perfil',
    name: 'Nome',
    enterName: 'Digite seu nome',
    email: 'Email',
    enterEmail: 'Digite seu email',
    phone: 'Número',
    enterPhone: 'Digite seu número',
    language: 'Idioma',
    selectLanguage: 'Selecione seu idioma',
    password: 'Senha',
    enterPassword: 'Digite sua senha',
    saveChanges: 'Salvar Alterações',
    saveError: 'Não foi possível salvar as alterações',
    
    // Login
    login: 'Entrar',
    forgotPassword: 'Esqueceu a senha?',
    noAccount: 'Não tem uma conta?',
    register: 'Cadastrar',
    loginError: 'Erro ao fazer login',
    loginSuccess: 'Login bem-sucedido!',
    welcomeBack: 'Bem-vindo de volta ao EcoPonto!',
    
    // Register
    createAccount: 'Criar conta',
    confirmPassword: 'Confirmar senha',
    hasAccount: 'Já tem uma conta?',
    registerError: 'Erro ao criar conta',
    registerSuccess: 'Cadastro realizado!',
    accountCreated: 'Sua conta foi criada com sucesso!',
    passwordMismatch: 'Senhas diferentes',
    passwordMismatchMessage: 'As senhas digitadas não coincidem',
    passwordTooShort: 'Senha muito curta',
    passwordLengthMessage: 'A senha deve ter pelo menos 6 caracteres',
    
    // Menu
    welcome: 'Bem-vindo',
    search: 'Pesquisar',
    categories: 'Categorias',
    favorites: 'Favoritos',
    settings: 'Configurações',
    
    // Perfil
    profile: 'Perfil',
    logout: 'Sair',
    editProfileButton: 'Editar Perfil',
  shareTitle: 'Compartilhar',
  shareMessage: 'Compartilhe o EcoPonto com seus amigos',
  copyLink: 'Copiar Link',
  comingSoon: 'Em breve',
  supportTitle: 'Suporte',
  supportMessage: 'Como podemos ajudar?',
  faq: 'FAQ',
  chat: 'Chat',
  logoutConfirm: 'Tem certeza que deseja sair da sua conta?',
    
    // Inicial
  findEcopoints: 'Encontre Ecopontos',
  nearbyLocations: 'Locais Próximos',
  seeAll: 'Ver Todos',
  places: 'Locais',
  searchPlaceholder: 'Buscar locais...',
  noResults: 'Local não encontrado, inicie sessão para melhor resultado.',
    
    // Favoritos
    yourFavorites: 'Seus Favoritos',
    noFavorites: 'Nenhum favorito ainda',
  itemsSavedTitle: 'Itens Salvos',
  noSavedItems: 'Você ainda não tem itens salvos',
  savedOn: 'Salvo em:',
    
    // Configurações / Settings
    notifications: 'Notificações',
    notificationsDescription: 'Receber alertas sobre novos pontos de coleta e dicas',
    backgroundLocation: 'Localização em segundo plano',
    backgroundLocationDescription: 'Permitir localização mesmo com o app fechado',
    darkMode: 'Modo escuro',
    darkModeDescription: 'Ativar tema escuro no aplicativo',
    appCache: 'Cache do aplicativo',
    appCacheDescription: 'Limpar dados temporários',
    aboutApp: 'Sobre o aplicativo',
    appVersion: 'Versão 1.0.0',
    
    // Permissions
    permissionNeeded: 'Permissão necessária',
    galleryAccess: 'É preciso permitir o acesso à galeria'
  },
  en: {
    // Common
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    fillAllFields: 'Please fill in all fields',
    ok: 'OK',
    home: 'Home',
    location: 'Location',
    locationMessage: 'Here you will see available locations',
    watchedCompanies: 'Watched Companies List',
    saved: 'Saved',
    send: 'Send',
    recentlyViewed: 'Recently Viewed',
    supportService: 'Support Service',
    userEmail: 'Email',
    
    // Languages
    portuguese: 'Portuguese',
    english: 'English',
    spanish: 'Spanish',
    
    // EdPerfil
    editProfile: 'Edit Profile',
    changePicture: 'Change Profile Picture',
    name: 'Name',
    enterName: 'Enter your name',
    email: 'Email',
    enterEmail: 'Enter your email',
    phone: 'Phone',
    enterPhone: 'Enter your phone number',
    language: 'Language',
    selectLanguage: 'Select your language',
    password: 'Password',
    enterPassword: 'Enter your password',
    saveChanges: 'Save Changes',
    saveError: 'Could not save changes',
    
    // Login
    login: 'Login',
    forgotPassword: 'Forgot password?',
    noAccount: 'Don\'t have an account?',
    register: 'Sign up',
    loginError: 'Login error',
    loginSuccess: 'Login successful!',
    welcomeBack: 'Welcome back to EcoPonto!',
    
    // Register
    createAccount: 'Create Account',
    confirmPassword: 'Confirm Password',
    hasAccount: 'Already have an account?',
    registerError: 'Error creating account',
    registerSuccess: 'Registration successful!',
    accountCreated: 'Your account has been created successfully!',
    passwordMismatch: 'Passwords don\'t match',
    passwordMismatchMessage: 'The passwords entered do not match',
    passwordTooShort: 'Password too short',
    passwordLengthMessage: 'Password must be at least 6 characters long',
    
    // Menu
    welcome: 'Welcome',
    search: 'Search',
    categories: 'Categories',
    favorites: 'Favorites',
    settings: 'Settings',
    
    // Perfil
    profile: 'Profile',
    logout: 'Logout',
    editProfileButton: 'Edit Profile',
  shareTitle: 'Share',
  shareMessage: 'Share EcoPonto with your friends',
  copyLink: 'Copy Link',
  comingSoon: 'Coming soon',
  supportTitle: 'Support',
  supportMessage: 'How can we help?',
  faq: 'FAQ',
  chat: 'Chat',
  logoutConfirm: 'Are you sure you want to sign out of your account?',
    
    // Inicial
    findEcopoints: 'Find Ecopoints',
    nearbyLocations: 'Nearby Locations',
  seeAll: 'See All',
  places: 'Places',
  searchPlaceholder: 'Search locations...',
  noResults: 'Location not found, sign in for better results.',
    
    // Favoritos
    yourFavorites: 'Your Favorites',
    noFavorites: 'No favorites yet',
  itemsSavedTitle: 'Saved Items',
  noSavedItems: 'You do not have any saved items',
  savedOn: 'Saved on:',
    
    // Settings
    notifications: 'Notifications',
    notificationsDescription: 'Receive alerts about new collection points and tips',
    backgroundLocation: 'Background location',
    backgroundLocationDescription: 'Allow location even when the app is closed',
    darkMode: 'Dark mode',
    darkModeDescription: 'Enable dark theme in the app',
    appCache: 'App cache',
    appCacheDescription: 'Clear temporary data',
    aboutApp: 'About the app',
    appVersion: 'Version 1.0.0',
    
    // Permissions
    permissionNeeded: 'Permission needed',
    galleryAccess: 'Gallery access is required'
  },
  es: {
    // Common
    error: 'Error',
    success: 'Éxito',
    save: 'Guardar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    fillAllFields: 'Por favor complete todos los campos',
    ok: 'OK',
    home: 'Inicio',
    location: 'Ubicación',
    locationMessage: 'Aquí verás las ubicaciones disponibles',
    watchedCompanies: 'Lista de empresas observadas',
    saved: 'Guardadas',
    send: 'Enviar',
    recentlyViewed: 'Vistos recientemente',
    supportService: 'Servicio de apoyo',
    userEmail: 'Correo',
    
    // Languages
    portuguese: 'Portugués',
    english: 'Inglés',
    spanish: 'Español',
    
    // EdPerfil
    editProfile: 'Editar Perfil',
    changePicture: 'Cambiar Foto de Perfil',
    name: 'Nombre',
    enterName: 'Ingrese su nombre',
    email: 'Correo',
    enterEmail: 'Ingrese su correo',
    phone: 'Teléfono',
    enterPhone: 'Ingrese su teléfono',
    language: 'Idioma',
    selectLanguage: 'Seleccione su idioma',
    password: 'Contraseña',
    enterPassword: 'Ingrese su contraseña',
    saveChanges: 'Guardar Cambios',
    saveError: 'No se pudieron guardar los cambios',
    
    // Login
    login: 'Iniciar Sesión',
    forgotPassword: '¿Olvidó su contraseña?',
    noAccount: '¿No tiene una cuenta?',
    register: 'Registrarse',
    loginError: 'Error al iniciar sesión',
    loginSuccess: '¡Inicio de sesión exitoso!',
    welcomeBack: '¡Bienvenido de vuelta a EcoPonto!',
    
    // Register
    createAccount: 'Crear Cuenta',
    confirmPassword: 'Confirmar Contraseña',
    hasAccount: '¿Ya tiene una cuenta?',
    registerError: 'Error al crear cuenta',
    registerSuccess: '¡Registro exitoso!',
    accountCreated: '¡Su cuenta ha sido creada con éxito!',
    passwordMismatch: 'Las contraseñas no coinciden',
    passwordMismatchMessage: 'Las contraseñas ingresadas no coinciden',
    passwordTooShort: 'Contraseña muy corta',
    passwordLengthMessage: 'La contraseña debe tener al menos 6 caracteres',
    
    // Menu
    welcome: 'Bienvenido',
    search: 'Buscar',
    categories: 'Categorías',
    favorites: 'Favoritos',
    settings: 'Configuración',
    
    // Perfil
    profile: 'Perfil',
    logout: 'Cerrar Sesión',
    editProfileButton: 'Editar Perfil',
  shareTitle: 'Compartir',
  shareMessage: 'Comparte EcoPunto con tus amigos',
  copyLink: 'Copiar enlace',
  comingSoon: 'Próximamente',
  supportTitle: 'Soporte',
  supportMessage: '¿Cómo podemos ayudar?',
  faq: 'FAQ',
  chat: 'Chat',
  logoutConfirm: '¿Estás seguro de que deseas cerrar sesión?',
    
    // Inicial
    findEcopoints: 'Encontrar Ecopuntos',
    nearbyLocations: 'Lugares Cercanos',
  seeAll: 'Ver Todo',
  places: 'Lugares',
  searchPlaceholder: 'Buscar lugares...',
  noResults: 'Local no encontrado, inicie sesión para mejores resultados.',
    
    // Favoritos
    yourFavorites: 'Sus Favoritos',
    noFavorites: 'Sin favoritos aún',
  itemsSavedTitle: 'Artículos guardados',
  noSavedItems: 'Aún no tienes elementos guardados',
  savedOn: 'Guardado en:',
    
    // Configuración
    notifications: 'Notificaciones',
    notificationsDescription: 'Recibir alertas sobre nuevos puntos de recolección y consejos',
    backgroundLocation: 'Ubicación en segundo plano',
    backgroundLocationDescription: 'Permitir ubicación incluso con la app cerrada',
    darkMode: 'Modo oscuro',
    darkModeDescription: 'Activar tema oscuro en la aplicación',
    appCache: 'Cache de la aplicación',
    appCacheDescription: 'Borrar datos temporales',
    aboutApp: 'Acerca de la aplicación',
    appVersion: 'Versión 1.0.0',
    
    // Permissions
    permissionNeeded: 'Permiso necesario',
    galleryAccess: 'Se requiere acceso a la galería'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('@app_language');
      if (storedLanguage && (storedLanguage === 'pt' || storedLanguage === 'en' || storedLanguage === 'es')) {
        setLanguage(storedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setAppLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('@app_language', newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setAppLanguage,
      translations: translations[language]
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};