import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TextbookScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center px-8">
      <Text className="text-4xl mb-4">📚</Text>
      <Text className="text-white text-xl font-bold mb-2 text-center">2026-27 小學用書儀表板</Text>
      <Text className="text-slate-400 text-sm text-center leading-relaxed">
        此儀表板在瀏覽器（Web）版本中查看以獲得最佳體驗。
        {'\n'}請使用 expo start --web 在瀏覽器開啟。
      </Text>
    </SafeAreaView>
  );
}
