import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ScrollView, Alert } from 'react-native';
import { colors } from '../styles/colors';
import QRCode from 'react-native-qrcode-svg';
import { FontAwesome5 } from '@expo/vector-icons';

export const KixikilaInviteScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const qrRef = useRef<any>(null);

  // Example invite link - in production, this should be unique per group
  const inviteLink = 'https://kixikila.app/invite/group-abc123-2025';
  const groupName = 'Kixikila Bairro Central';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Junta-te à minha Kixikila! ${groupName}\n\nLink: ${inviteLink}\n\nBaixa agora e contribui para a poupança comunitária.`,
        url: inviteLink,
        title: 'Convite para Kixikila',
      });
    } catch (error) {
      console.error('Erro ao partilhar:', error);
    }
  };

  const handleDownloadQR = () => {
    Alert.alert('QR Code', 'QR Code é exibido acima. Partilha ou fotografa para enviar para amigos.');
  };

  const handleCopyLink = () => {
    // Simulate clipboard copy (in real app, use react-native-clipboard)
    Alert.alert('Link copiado', inviteLink);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>⬅ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Convidar Participantes</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.groupTitle}>{groupName}</Text>
        <Text style={styles.hint}>Partilha este QR code ou link com amigos</Text>
      </View>

      {/* QR Code */}
      <View style={styles.qrContainer}>
        <View style={styles.qrBox}>
          <QRCode
            ref={qrRef}
            value={inviteLink}
            size={240}
            color={colors.darkBlue}
            backgroundColor={colors.white}
          />
        </View>
      </View>

      {/* Invite Link */}
      <View style={styles.card}>
        <Text style={styles.label}>Link de Convite</Text>
        <View style={styles.linkBox}>
          <Text style={styles.linkText} numberOfLines={2}>
            {inviteLink}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.primaryButton} onPress={handleShare}>
        <FontAwesome5 name="share-alt" size={16} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.primaryButtonText}>Partilhar via Rede Social</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleCopyLink}>
        <FontAwesome5 name="copy" size={16} color={colors.secondary} style={{ marginRight: 8 }} />
        <Text style={styles.secondaryButtonText}>Copiar Link</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleDownloadQR}>
        <FontAwesome5 name="download" size={16} color={colors.secondary} style={{ marginRight: 8 }} />
        <Text style={styles.secondaryButtonText}>Guardar QR Code</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Dica</Text>
        <Text style={styles.infoText}>
          Partilha o link ou mostra o QR code aos teus amigos. Quando escanearem ou seguirem o link, serão adicionados à tua Kixikila automaticamente.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  back: { color: colors.secondary, marginRight: 12, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '700', color: colors.darkBlue },
  card: { backgroundColor: colors.background, margin: 20, borderRadius: 12, padding: 16 },
  groupTitle: { fontSize: 16, fontWeight: '700', color: colors.darkBlue, marginBottom: 8 },
  hint: { color: colors.lightText, fontSize: 14 },
  qrContainer: { alignItems: 'center', marginVertical: 20 },
  qrBox: { padding: 16, backgroundColor: colors.white, borderRadius: 12, borderWidth: 2, borderColor: colors.border },
  label: { fontWeight: '700', color: colors.darkBlue, marginBottom: 8 },
  linkBox: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12 },
  linkText: { color: colors.secondary, fontWeight: '600', fontSize: 12 },
  primaryButton: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  secondaryButton: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: colors.secondary, fontWeight: '700', fontSize: 14 },
  infoCard: { margin: 20, backgroundColor: '#FFF8E1', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#FFA500' },
  infoTitle: { fontWeight: '700', color: colors.darkBlue, marginBottom: 8 },
  infoText: { color: colors.darkBlue, fontSize: 13, lineHeight: 20 },
});
