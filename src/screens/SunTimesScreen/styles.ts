import { StyleSheet } from 'react-native';
import { Layout } from '../../constants/Layout';
import { ThemeColors } from '../../contexts/ThemeContext';

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: Layout.spacing.md,
  },
  header: {
    marginBottom: Layout.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: Layout.fontSize.hero,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: Layout.fontSize.base,
    color: colors.textSecondary,
  },
  locationCard: {
    marginBottom: Layout.spacing.md,
  },
  locationHeader: {
    marginBottom: Layout.spacing.md,
  },
  locationTitle: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: Layout.spacing.xs,
  },
  locationSubtitle: {
    fontSize: Layout.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  dateCard: {
    marginBottom: Layout.spacing.md,
  },
  dateNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    backgroundColor: colors.card,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.sm,
  },
  navButton: {
    padding: Layout.spacing.sm,
    minWidth: 44,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
  },
  timelineCard: {
    marginBottom: Layout.spacing.md,
  },
  infoCard: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: Layout.spacing.md,
  },
  locationText: {
    fontSize: Layout.fontSize.base,
    color: colors.text,
    marginBottom: Layout.spacing.xs,
  },
  locationButton: {
    marginTop: Layout.spacing.md,
  },
  currentLocationInfo: {
    backgroundColor: colors.background,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginTop: Layout.spacing.sm,
  },
  locationDetails: {
    fontSize: Layout.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  dateText: {
    fontSize: Layout.fontSize.lg,
    color: colors.text,
    fontWeight: '600',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: Layout.spacing.md,
  },
  timeContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: Layout.fontSize.base,
    color: colors.text,
    flex: 1,
  },
  timeValue: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: colors.accent,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.sm,
  },
  infoLabel: {
    fontSize: Layout.fontSize.base,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
});
