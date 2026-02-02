import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import DayRecordCard from "@/src/components/DayRecordCard";
import FilterChips, { type FilterKey } from "@/src/components/FilterChips";
import { useDayRecords } from "@/src/context/day-records-context";

const FLAG_KEY_MAP: Record<
  Exclude<FilterKey, "all">,
  keyof ReturnType<typeof useDayRecords>["records"][0]["flags"]
> = {
  money: "moneyRequest",
  favor: "favorRequest",
  praise: "excessivePraise",
  link: "linkIncluded",
  image: "imageIncluded",
};

export default function TimelineScreen() {
  const router = useRouter();
  const { records, markImmediateRiskShown } = useDayRecords();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [riskTargetId, setRiskTargetId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return sorted;
    const flagKey = FLAG_KEY_MAP[filter];
    return sorted.filter((record) => record.flags[flagKey]);
  }, [sorted, filter]);

  useEffect(() => {
    const candidate = records.find(
      (record) =>
        !record.immediateRiskShown &&
        ((record.immediateRisk?.scamUrl ?? false) ||
          (record.immediateRisk?.reportedAccount ?? false) ||
          (record.immediateRisk?.aiImage ?? false)),
    );
    if (candidate) {
      setRiskTargetId(candidate.id);
    }
  }, [records]);

  const riskLabels = useMemo(() => {
    if (!riskTargetId) return [];
    const target = records.find((record) => record.id === riskTargetId);
    if (!target || !target.immediateRisk) return [];
    return [
      target.immediateRisk.scamUrl ? "신고된 링크" : null,
      target.immediateRisk.reportedAccount ? "신고된 계좌" : null,
      target.immediateRisk.aiImage ? "합성 이미지" : null,
    ].filter(Boolean) as string[];
  }, [records, riskTargetId]);

  const handleRiskDismiss = async () => {
    if (riskTargetId) {
      const target = records.find((record) => record.id === riskTargetId);
      if (target) {
        await markImmediateRiskShown(target.date);
      }
    }
    setRiskTargetId(null);
  };

  const handleRiskReport = async () => {
    if (riskTargetId) {
      const target = records.find((record) => record.id === riskTargetId);
      if (target) {
        await markImmediateRiskShown(target.date);
      }
    }
    setRiskTargetId(null);
    router.push("/(tabs)/profile/report");
  };

  if (records.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>아직 기록이 없어요</Text>
          <Text style={styles.emptyBody}>
            홈에서 오늘의 대화를 먼저 새에게 건네주세요.
          </Text>
          <Pressable
            style={styles.homeButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.homeButtonText}>홈으로 가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>기록</Text>
            <Text style={styles.subtitle}>하루의 사실만 모아두었어요.</Text>
            <FilterChips selected={filter} onSelect={setFilter} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.filterEmpty}>
            <Text style={styles.filterEmptyTitle}>해당 기록이 없어요</Text>
            <Text style={styles.filterEmptyBody}>
              다른 필터를 선택해보세요.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <DayRecordCard
            record={item}
            onPress={() =>
              router.push({
                pathname: "/timeline/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {riskTargetId ? (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <Text style={styles.overlayTitle}>
              이미 신고된 사기 정보입니다.
            </Text>
            <View style={styles.overlayList}>
              {riskLabels.map((label) => (
                <Text key={label} style={styles.overlayItem}>
                  {label}
                </Text>
              ))}
            </View>
            <View style={styles.overlayActions}>
              <Pressable
                style={styles.overlayButtonGhost}
                onPress={() => void handleRiskDismiss()}
              >
                <Text style={styles.overlayGhostText}>닫기</Text>
              </Pressable>
              <Pressable
                style={styles.overlayButton}
                onPress={() => void handleRiskReport()}
              >
                <Text style={styles.overlayButtonText}>Report로 이동</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f0eb",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 8,
    paddingBottom: 8,
    backgroundColor: "#f8f0eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#5f5147",
  },
  subtitle: {
    fontSize: 14,
    color: "#807167",
  },
  separator: {
    height: 12,
  },
  filterEmpty: {
    marginTop: 24,
    gap: 6,
  },
  filterEmptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5f5147",
  },
  filterEmptyBody: {
    fontSize: 13,
    color: "#807167",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#5f5147",
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#807167",
    textAlign: "center",
  },
  homeButton: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(232, 202, 191, 0.9)",
  },
  homeButtonText: {
    fontSize: 14,
    color: "#5d4e45",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(50, 40, 32, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  overlayCard: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#f7eeea",
    padding: 18,
    gap: 10,
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5c4e44",
  },
  overlayList: {
    gap: 6,
  },
  overlayItem: {
    fontSize: 13,
    color: "#7b6c62",
  },
  overlayActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  overlayButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(232, 202, 191, 0.9)",
  },
  overlayButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5d4e45",
  },
  overlayButtonGhost: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  overlayGhostText: {
    fontSize: 13,
    color: "#7b6c62",
  },
});
