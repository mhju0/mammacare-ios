import { useApp } from "../context/AppContext";
import Home from "./Home";
import Dashboard from "./Dashboard";

/**
 * 홈 경로 분기:
 * - 로그인 + 활성 아기 프로필이 있으면 알레르기 대시보드를 히어로로 노출.
 * - 그 외(비로그인/아기 미등록)는 기존 마케팅 히어로(Home)를 그대로 유지.
 */
export default function HomeRoute() {
  const { token, activeBaby } = useApp();
  if (token && activeBaby) return <Dashboard />;
  return <Home />;
}
