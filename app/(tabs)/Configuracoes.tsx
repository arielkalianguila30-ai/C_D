import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Feather, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ConfigItem {
  id: string;
  title: string;
  type: 'toggle' | 'action' | 'info';
  icon: string;
  value?: boolean;
  action?: () => void;
  description?: string;
}

export default function Configuracoes() {
  const router = useRouter();
  const { translations, setAppLanguage, language } = useLanguage();
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);

  const languages = [
    { code: 'pt', name: translations.portuguese },
    { code: 'en', name: translations.english },
    { code: 'es', name: translations.spanish }
  ];
  const { theme, toggleTheme, colors } = useTheme();

  // local toggle state for simple toggles (notifications, background location, ...)
  const [toggles, setToggles] = React.useState<Record<string, boolean>>({
    '1': true,
    '2': false,
  });

  const configuracoes = React.useMemo<ConfigItem[]>(() => [
    {
      id: '1',
      title: translations.notifications || 'Notificações',
      type: 'toggle',
      icon: 'bell',
      value: toggles['1'],
      description: translations.notificationsDescription || 'Receber alertas sobre novos pontos de coleta e dicas',
    },
    {
      id: '2',
      title: translations.backgroundLocation || 'Localização em segundo plano',
      type: 'toggle',
      icon: 'map-pin',
      value: toggles['2'],
      description: translations.backgroundLocationDescription || 'Permitir localização mesmo com o app fechado',
    },
    {
      id: '3',
      title: translations.darkMode || 'Modo escuro',
      type: 'toggle',
      icon: 'moon',
      description: translations.darkModeDescription || 'Ativar tema escuro no aplicativo',
    },
    {
      id: '4',
      title: translations.language || 'Idioma',
      type: 'action',
      icon: 'globe',
      description: translations.language,
      action: () => setShowLanguageModal(true),
    },
    {
      id: '5',
      title: translations.appCache || 'Cache do aplicativo',
      type: 'action',
      icon: 'trash-2',
      description: translations.appCacheDescription || 'Limpar dados temporários',
      action: () => Alert.alert(translations.appCache || 'Limpar cache', translations.appCacheDescription || 'Deseja limpar o cache do aplicativo?', [
        { text: translations.cancel || 'Cancelar', style: 'cancel' },
        { 
          text: translations.ok || 'Limpar',
          style: 'destructive',
          onPress: () => Alert.alert(translations.success || 'Sucesso', translations.appCacheDescription || 'Cache limpo com sucesso!')
        }
      ]),
    },
    {
      id: '6',
      title: translations.aboutApp || 'Sobre o aplicativo',
      type: 'info',
      icon: 'info',
      description: translations.appVersion || 'Versão 1.0.0',
    },
  ], [translations, toggles]);

  const handleToggle = (id: string) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.surface }]}> 
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/Perfil')}
        >
          <AntDesign name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
  <Text style={[styles.title, { color: colors.primary }]}>{translations.settings || 'Configurações'}</Text>
      </View>

      <ScrollView style={styles.content}>
        {configuracoes.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.configItem, { borderBottomColor: colors.muted }]}
            onPress={() => item.action && item.action()}
          >
            <View style={styles.configLeft}>
              <Feather name={item.icon as any} size={24} color={colors.primary} />
              <View style={styles.configTexts}>
                <Text style={[styles.configTitle, { color: colors.text }]}>{item.title}</Text>
                {item.description && (
                  <Text style={[styles.configDescription, { color: colors.muted }]}>{item.description}</Text>
                )}
              </View>
            </View>

            {item.type === 'toggle' && (
              // Special-case the dark mode toggle so it reflects ThemeContext
              item.id === '3' ? (
                <Switch
                  trackColor={{ false: '#3a3a3a', true: '#34d399' }}
                  thumbColor={theme === 'dark' ? colors.primary : '#f5f5f5'}
                  onValueChange={() => toggleTheme()}
                  value={theme === 'dark'}
                />
              ) : (
                <Switch
                  trackColor={{ false: '#e0e0e0', true: '#a5d6a7' }}
                  thumbColor={item.value ? colors.primary : '#f5f5f5'}
                  onValueChange={() => handleToggle(item.id)}
                  value={!!item.value}
                />
              )
            )}
            {item.type === 'action' && (
              <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{translations.selectLanguage}</Text>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.languageOption}
                  onPress={async () => {
                    try {
                      await setAppLanguage(item.code as 'pt' | 'en' | 'es');
                    } catch (e) {
                      console.warn('Failed to set language', e);
                    }
                    setShowLanguageModal(false);
                  }}
                >
                  <Text style={[styles.languageOptionText, item.code === language && styles.selectedLanguage]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    color: '#2fd24a',
  },
  content: {
    flex: 1,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  configLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  configTexts: {
    marginLeft: 15,
    flex: 1,
  },
  configTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  configDescription: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    width: '85%',
    borderRadius: 12,
    padding: 16,
    maxHeight: '70%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  languageOption: {
    paddingVertical: 12,
    borderBottomColor: '#e6e6e6',
    borderBottomWidth: 1,
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguage: {
    color: '#2fd24a',
    fontWeight: '700',
  },
});