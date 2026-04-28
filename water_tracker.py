#!/usr/bin/env python3
"""Water intake tracker - record time, amount, and type of each drink."""

import argparse
import json
import os
from datetime import datetime, date, timedelta
from pathlib import Path

DATA_FILE = Path.home() / ".water_tracker" / "records.json"

DRINK_TYPES = {
    "water": "清水",
    "tea": "茶",
    "coffee": "咖啡",
    "juice": "果汁",
    "sports": "運動飲料",
    "milk": "牛奶",
    "other": "其他",
}


def load_records():
    if not DATA_FILE.exists():
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_records(records):
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)


def cmd_add(args):
    records = load_records()
    now = datetime.now()

    if args.time:
        try:
            t = datetime.strptime(args.time, "%H:%M")
            record_time = now.replace(hour=t.hour, minute=t.minute, second=0, microsecond=0)
        except ValueError:
            print("時間格式錯誤，請用 HH:MM（例如 14:30）")
            return
    else:
        record_time = now

    drink_type = args.type
    if drink_type not in DRINK_TYPES:
        print(f"不認識的種類「{drink_type}」，可用種類：{', '.join(DRINK_TYPES.keys())}")
        return

    record = {
        "timestamp": record_time.isoformat(),
        "amount": args.amount,
        "type": drink_type,
    }
    records.append(record)
    save_records(records)

    type_label = DRINK_TYPES[drink_type]
    print(f"已記錄：{record_time.strftime('%Y-%m-%d %H:%M')}  {type_label}  {args.amount} ml")


def cmd_today(args):
    records = load_records()
    today_str = date.today().isoformat()
    today_records = [r for r in records if r["timestamp"].startswith(today_str)]

    if not today_records:
        print("今日尚無飲水記錄")
        return

    print(f"{'時間':<8}  {'種類':<8}  {'份量':>6}")
    print("-" * 28)
    total = 0
    for r in today_records:
        t = datetime.fromisoformat(r["timestamp"]).strftime("%H:%M")
        label = DRINK_TYPES.get(r["type"], r["type"])
        amount = r["amount"]
        total += amount
        print(f"{t:<8}  {label:<8}  {amount:>5} ml")

    print("-" * 28)
    print(f"{'合計':<18}  {total:>5} ml")


def cmd_history(args):
    records = load_records()
    days = args.days
    cutoff = (date.today() - timedelta(days=days - 1)).isoformat()
    filtered = [r for r in records if r["timestamp"][:10] >= cutoff]

    if not filtered:
        print(f"最近 {days} 天沒有記錄")
        return

    daily = {}
    for r in filtered:
        day = r["timestamp"][:10]
        daily.setdefault(day, {"total": 0, "records": []})
        daily[day]["total"] += r["amount"]
        daily[day]["records"].append(r)

    for day in sorted(daily.keys(), reverse=True):
        info = daily[day]
        print(f"\n{day}  共 {info['total']} ml")
        for r in info["records"]:
            t = datetime.fromisoformat(r["timestamp"]).strftime("%H:%M")
            label = DRINK_TYPES.get(r["type"], r["type"])
            print(f"  {t}  {label}  {r['amount']} ml")


def cmd_stats(args):
    records = load_records()
    if not records:
        print("尚無任何記錄")
        return

    days = args.days
    cutoff = (date.today() - timedelta(days=days - 1)).isoformat()
    filtered = [r for r in records if r["timestamp"][:10] >= cutoff]

    if not filtered:
        print(f"最近 {days} 天沒有記錄")
        return

    total = sum(r["amount"] for r in filtered)
    daily_counts = {}
    type_totals = {}
    for r in filtered:
        day = r["timestamp"][:10]
        daily_counts[day] = daily_counts.get(day, 0) + r["amount"]
        t = r["type"]
        type_totals[t] = type_totals.get(t, 0) + r["amount"]

    avg = total / len(daily_counts)
    print(f"最近 {days} 天統計")
    print(f"  記錄天數：{len(daily_counts)} 天")
    print(f"  總飲水量：{total} ml")
    print(f"  日均飲水：{avg:.0f} ml")
    print(f"\n  各種類分佈：")
    for t, amt in sorted(type_totals.items(), key=lambda x: -x[1]):
        label = DRINK_TYPES.get(t, t)
        pct = amt / total * 100
        print(f"    {label:<8}  {amt:>6} ml  ({pct:.1f}%)")


def cmd_delete(args):
    records = load_records()
    today_str = date.today().isoformat()
    today_records = [(i, r) for i, r in enumerate(records) if r["timestamp"].startswith(today_str)]

    if not today_records:
        print("今日尚無飲水記錄")
        return

    print("今日記錄：")
    for idx, (_, r) in enumerate(today_records):
        t = datetime.fromisoformat(r["timestamp"]).strftime("%H:%M")
        label = DRINK_TYPES.get(r["type"], r["type"])
        print(f"  [{idx}] {t}  {label}  {r['amount']} ml")

    try:
        choice = int(input("輸入要刪除的編號（取消請按 Ctrl+C）："))
        if 0 <= choice < len(today_records):
            orig_idx = today_records[choice][0]
            removed = records.pop(orig_idx)
            save_records(records)
            t = datetime.fromisoformat(removed["timestamp"]).strftime("%H:%M")
            label = DRINK_TYPES.get(removed["type"], removed["type"])
            print(f"已刪除：{t}  {label}  {removed['amount']} ml")
        else:
            print("編號超出範圍")
    except (ValueError, KeyboardInterrupt):
        print("\n已取消")


def main():
    parser = argparse.ArgumentParser(
        prog="water_tracker",
        description="飲水記錄工具 - 記錄每次飲水的時間、份量、種類",
    )
    sub = parser.add_subparsers(dest="command", metavar="指令")
    sub.required = True

    # add
    p_add = sub.add_parser("add", help="新增一筆飲水記錄")
    p_add.add_argument("-a", "--amount", type=int, default=250, metavar="ml", help="份量（ml），預設 250")
    p_add.add_argument(
        "-t", "--type", default="water", choices=DRINK_TYPES.keys(),
        metavar="種類", help="種類：" + "、".join(f"{k}({v})" for k, v in DRINK_TYPES.items()),
    )
    p_add.add_argument("--time", metavar="HH:MM", help="記錄時間（預設為現在）")
    p_add.set_defaults(func=cmd_add)

    # today
    p_today = sub.add_parser("today", help="查看今日記錄")
    p_today.set_defaults(func=cmd_today)

    # history
    p_hist = sub.add_parser("history", help="查看近期歷史記錄")
    p_hist.add_argument("-d", "--days", type=int, default=7, metavar="天數", help="查看最近幾天（預設 7）")
    p_hist.set_defaults(func=cmd_history)

    # stats
    p_stats = sub.add_parser("stats", help="統計分析")
    p_stats.add_argument("-d", "--days", type=int, default=30, metavar="天數", help="統計最近幾天（預設 30）")
    p_stats.set_defaults(func=cmd_stats)

    # delete
    p_del = sub.add_parser("delete", help="刪除今日某筆記錄")
    p_del.set_defaults(func=cmd_delete)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
