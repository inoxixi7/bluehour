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
    paddingTop: Layout.spacing.sm,
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
  dateListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.xs,
  },
  dateItem: {
    flex: 1,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
  },
  dateDay: {
    fontSize: Layout.fontSize.xs,
    marginBottom: 2,
  },
  dateNumber: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    marginBottom: 2,
  },
  dateMonth: {
    fontSize: Layout.fontSize.xs,
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
    marginBottom: Layout.spacing.sm,
  },
  infoCard: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.base,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: Layout.spacing.sm,
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
    paddingVertical: Layout.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  colorIndicator: {
    width: 3,
    height: 32,
    borderRadius: 1.5,
    marginRight: Layout.spacing.sm,
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
    fontWeight: '500',
  },
  timeValue: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.xs,
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
