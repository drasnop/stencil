var mapping = [
	{
		"selector":".addTask-input",
		"options":["shortcut_add_new_task"]
	},
	{
		"selector":	".taskItem-star .icon.task-starred, "+
					".taskItem-star .wundercon.starred, "+
					".detail-star .icon.detail-starred, "+
					".detail-star .wundercon.starred",
		"options":["behavior_star_tasks_to_top","shortcut_mark_task_starred"]
	},
	{
		"selector":	".taskItem-duedate, "+
					".detail-date .token_0",
		"options":["date_format","start_of_week"]
	},
	
	{
		"selector":	".detail-checkbox .checkBox, "+
					".taskItem-checkboxWrapper .checkBox",
		"options":["sound_checkoff_enabled","shortcut_mark_task_done"]
	},
	{
		"selector":".filters-collection .sidebarItem a[href='#/lists/inbox']",
		"options":["shortcut_goto_inbox"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='All']",
		"options":["smartlist_visibility_all","shortcut_goto_filter_all"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Assigned to me']",
		"options":["smartlist_visibility_assigned_to_me","shortcut_goto_filter_assigned"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Completed']",
		"options":["smartlist_visibility_done","shortcut_goto_filter_completed"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Starred']",
		"options":["smartlist_visibility_starred","shortcut_goto_filter_starred"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Today']",
		"options":["smartlist_visibility_today","shortcut_goto_filter_today"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Week']",
		"options":["smartlist_visibility_week","shortcut_goto_filter_week"]
	},
	{
		"selector":	"#main-toolbar .wundercon.bell-medium, "+
					".detail-reminder .wundercon.reminder",
		"options":["notifications_desktop_enabled","notifications_email_enabled",
					"notifications_push_enabled","sound_notification_enabled"]
	},
	{
		"selector": ".avatar",
		"options":["shortcut_sync","shortcut_goto_preferences"]
	},
	{
		"selector":"#main-toolbar .wundercon.search",
		"options":["shortcut_goto_search"]
	},
	{
		"selector":".sidebarActions-addList",
		"options":["shortcut_add_new_list"]
	},
	{
		"selector":".actionBar-bottom div.tab.more",
		"options":["print_completed_items"]
	},
	{
		"selector":".detail-trash .wundercon.trash",
		"options":["confirm_delete_entity","shortcut_delete"]
	}
];
var options=
{
	"_locale": {
		"id": "_locale",
		"label": "",
		"value": "en",
		"values": [
		"en"
		],
		"tab": "",
		"index": 0
	},
	"account_locale": {
		"id": "account_locale",
		"label": "",
		"value": "en_GB",
		"values": [
		"en_GB"
		],
		"tab": "",
		"index": 0
	},
	"add_to_chrome": {
		"id": "add_to_chrome",
		"label": "",
		"value": false,
		"values": [],
		"tab": "",
		"index": 0
	},
	"add_to_firefox": {
		"id": "add_to_firefox",
		"label": "",
		"value": false,
		"values": [],
		"tab": "",
		"index": 0
	},
	"app_first_used": {
		"id": "app_first_used",
		"label": "",
		"value": 1421913600000,
		"values": [
		"1421913600000"
		],
		"tab": "",
		"index": 0
	},
	"auto_reminder_noticeperiod": {
		"id": "auto_reminder_noticeperiod",
		"label": "",
		"value": 0,
		"values": [
		"0"
		],
		"tab": "",
		"index": 0
	},
	"auto_reminder_timeinterval": {
		"id": "auto_reminder_timeinterval",
		"label": "",
		"value": 540,
		"values": [
		"540"
		],
		"tab": "",
		"index": 0
	},
	"background": {
		"id": "background",
		"label": "",
		"value": "wlbackground15",
		"values": [
		"wlbackground15"
		],
		"tab": "",
		"index": 0
	},
	"behavior_star_tasks_to_top": {
		"id": "behavior_star_tasks_to_top",
		"label": "Star moves item to top",
		"value": true,
		"values": [],
		"tab": "General",
		"index": 8
	},
	"chrome_app_rating_later": {
		"id": "chrome_app_rating_later",
		"label": "",
		"value": "undefined",
		"values": [
		"undefined"
		],
		"tab": "",
		"index": 0
	},
	"chrome_rating_later": {
		"id": "chrome_rating_later",
		"label": "",
		"value": "undefined",
		"values": [
		"undefined"
		],
		"tab": "",
		"index": 0
	},
	"confirm_delete_entity": {
		"id": "confirm_delete_entity",
		"label": "Confirm before deleting items",
		"value": true,
		"values": [],
		"tab": "General",
		"index": 7
	},
	"date_format": {
		"id": "date_format",
		"label": "Date Format",
		"value": "DD.MM.YYYY",
		"values": [
		"DD.MM.YYYY"
		],
		"tab": "General",
		"index": 1
	},
	"enable_natural_date_recognition": {
		"id": "enable_natural_date_recognition",
		"label": "",
		"value": true,
		"values": [],
		"tab": "",
		"index": 0
	},
	"id": {
		"id": "id",
		"label": "",
		"value": "userSettings",
		"values": [
		"userSettings"
		],
		"tab": "",
		"index": 0
	},
	"language": {
		"id": "language",
		"label": "Language",
		"value": "en_GB",
		"values": [
		"en_GB"
		],
		"tab": "General",
		"index": 0
	},
	"last_open_app_date": {
		"id": "last_open_app_date",
		"label": "",
		"value": 0,
		"values": [
		"0"
		],
		"tab": "",
		"index": 0
	},
	"migrated_wunderlist_one_user": {
		"id": "migrated_wunderlist_one_user",
		"label": "",
		"value": true,
		"values": [],
		"tab": "",
		"index": 0
	},
	"new_installation": {
		"id": "new_installation",
		"label": "",
		"value": false,
		"values": [],
		"tab": "",
		"index": 0
	},
	"new_task_location": {
		"id": "new_task_location",
		"label": "Add Items",
		"value": "top",
		"values": [
		"top","bottom"
		],
		"tab": "General",
		"index": 6
	},
	"newsletter_subscription_enabled": {
		"id": "newsletter_subscription_enabled",
		"label": "",
		"value": false,
		"values": [],
		"tab": "",
		"index": 0
	},
	"notifications_desktop_enabled": {
		"id": "notifications_desktop_enabled",
		"label": "Desktop Notifications",
		"value": true,
		"values": [],
		"tab": "Notifications",
		"index": 2
	},
	"notifications_email_enabled": {
		"id": "notifications_email_enabled",
		"label": "Email Notifications",
		"value": true,
		"values": [],
		"tab": "Notifications",
		"index": 0
	},
	"notifications_push_enabled": {
		"id": "notifications_push_enabled",
		"label": "Push Notifications",
		"value": true,
		"values": [],
		"tab": "Notifications",
		"index": 1
	},
	"onboarding_add_todo": {
		"id": "onboarding_add_todo",
		"label": "",
		"value": true,
		"values": [],
		"tab": "",
		"index": 0
	},
	"onboarding_click_create_list": {
		"id": "onboarding_click_create_list",
		"label": "",
		"value": true,
		"values": [],
		"tab": "",
		"index": 0
	},
	"onboarding_click_share_list": {
		"id": "onboarding_click_share_list",
		"label": "",
		"value": true,
		"values": [],
		"tab": "",
		"index": 0
	},
	"print_completed_items": {
		"id": "print_completed_items",
		"label": "Print completed items",
		"value": false,
		"values": [],
		"tab": "General",
		"index": 9
	},
	"pro_trial_limit_assigning": {
		"id": "pro_trial_limit_assigning",
		"label": "",
		"value": 3,
		"values": [
		"3"
		],
		"tab": "",
		"index": 0
	},
	"pro_trial_limit_comments": {
		"id": "pro_trial_limit_comments",
		"label": "",
		"value": 10,
		"values": [
		"10"
		],
		"tab": "",
		"index": 0
	},
	"pro_trial_limit_files": {
		"id": "pro_trial_limit_files",
		"label": "",
		"value": 3,
		"values": [
		"3"
		],
		"tab": "",
		"index": 0
	},
	"shortcut_add_new_list": {
		"id": "shortcut_add_new_list",
		"label": "Add a New List",
		"value": "CTRL + L",
		"values": [
		"CTRL + L"
		],
		"tab": "Shortcuts",
		"index": 1
	},
	"shortcut_add_new_task": {
		"id": "shortcut_add_new_task",
		"label": "Add a New Item",
		"value": "CTRL + 0",
		"values": [
		"CTRL + 0"
		],
		"tab": "Shortcuts",
		"index": 0
	},
	"shortcut_copy_tasks": {
		"id": "shortcut_copy_tasks",
		"label": "",
		"value": "CTRL + C",
		"values": [
		"CTRL + C"
		],
		"tab": "",
		"index": 0
	},
	"shortcut_cut_tasks": {
		"id": "shortcut_cut_tasks",
		"label": "",
		"value": "CTRL + X",
		"values": [
		"CTRL + X"
		],
		"tab": "",
		"index": 0
	},
	"shortcut_delete": {
		"id": "shortcut_delete",
		"label": "Delete Selected List or Item",
		"value": "CTRL + BACKSPACE",
		"values": [
		"CTRL + BACKSPACE"
		],
		"tab": "Shortcuts",
		"index": 5
	},
	"shortcut_goto_filter_all": {
		"id": "shortcut_goto_filter_all",
		"label": "Open 'All' Smart List",
		"value": "CTRL + 5",
		"values": [
		"CTRL + 5"
		],
		"tab": "Shortcuts-more",
		"index": 15
	},
	"shortcut_goto_filter_assigned": {
		"id": "shortcut_goto_filter_assigned",
		"label": "Open 'Assigned to Me' Smart List",
		"value": "CTRL + 1",
		"values": [
		"CTRL + 1"
		],
		"tab": "Shortcuts-more",
		"index": 11
	},
	"shortcut_goto_filter_completed": {
		"id": "shortcut_goto_filter_completed",
		"label": "Open 'Completed' Smart List",
		"value": "CTRL + 6",
		"values": [
		"CTRL + 6"
		],
		"tab": "Shortcuts-more",
		"index": 16
	},
	"shortcut_goto_filter_starred": {
		"id": "shortcut_goto_filter_starred",
		"label": "Open 'Starred' Smart List",
		"value": "CTRL + 2",
		"values": [
		"CTRL + 2"
		],
		"tab": "Shortcuts-more",
		"index": 12
	},
	"shortcut_goto_filter_today": {
		"id": "shortcut_goto_filter_today",
		"label": "Open 'Today' Smart List",
		"value": "CTRL + 3",
		"values": [
		"CTRL + 3"
		],
		"tab": "Shortcuts-more",
		"index": 13
	},
	"shortcut_goto_filter_week": {
		"id": "shortcut_goto_filter_week",
		"label": "Open 'Week' Smart List",
		"value": "CTRL + 4",
		"values": [
		"CTRL + 4"
		],
		"tab": "Shortcuts-more",
		"index": 14
	},
	"shortcut_goto_inbox": {
		"id": "shortcut_goto_inbox",
		"label": "Open Inbox",
		"value": "CTRL + I",
		"values": [
		"CTRL + I"
		],
		"tab": "Shortcuts-more",
		"index": 10
	},
	"shortcut_goto_preferences": {
		"id": "shortcut_goto_preferences",
		"label": "Open Preferences",
		"value": "CTRL + P",
		"values": [
		"CTRL + P", "CTRL + ."
		],
		"tab": "Shortcuts-more",
		"index": 7
	},
	"shortcut_goto_search": {
		"id": "shortcut_goto_search",
		"label": "Focus Search",
		"value": "CTRL + F",
		"values": [
		"CTRL + F"
		],
		"tab": "Shortcuts",
		"index": 6
	},
	"shortcut_mark_task_done": {
		"id": "shortcut_mark_task_done",
		"label": "Mark Selected Items as 'Completed'",
		"value": "CTRL + D",
		"values": [
		"CTRL + D"
		],
		"tab": "Shortcuts",
		"index": 2
	},
	"shortcut_mark_task_starred": {
		"id": "shortcut_mark_task_starred",
		"label": "Mark Selected Items as 'Starred'",
		"value": "CTRL + S",
		"values": [
		"CTRL + S", "CTRL + T"
		],
		"tab": "Shortcuts",
		"index": 3
	},
	"shortcut_paste_tasks": {
		"id": "shortcut_paste_tasks",
		"label": "",
		"value": "CTRL + V",
		"values": [
		"CTRL + V"
		],
		"tab": "",
		"index": 0
	},
	"shortcut_select_all_tasks": {
		"id": "shortcut_select_all_tasks",
		"label": "Select All Items",
		"value": "CTRL + A",
		"values": [
		"CTRL + A"
		],
		"tab": "Shortcuts",
		"index": 4
	},
	"shortcut_send_via_email": {
		"id": "shortcut_send_via_email",
		"label": "Email List",
		"value": "CTRL + E",
		"values": [
		"CTRL + E"
		],
		"tab": "Shortcuts-more",
		"index": 8
	},
	"shortcut_show_notifications": {
		"id": "shortcut_show_notifications",
		"label": "Show Activities",
		"value": "CTRL + SHIFT + A",
		"values": [
		"CTRL + SHIFT + A"
		],
		"tab": "Shortcuts-more",
		"index": 9
	},
	"shortcut_sync": {
		"id": "shortcut_sync",
		"label": "Sync",
		"value": "R",
		"values": [
		"R"
		],
		"tab": "Shortcuts",
		"index": 17
	},
	"show_completed_items": {
		"id": "show_completed_items",
		"label": "",
		"value": true,
		"values": [],
		"tab": "",
		"index": 0
	},
	"significant_event_count": {
		"id": "significant_event_count",
		"label": "",
		"value": 0,
		"values": [
		"0"
		],
		"tab": "",
		"index": 0
	},
	"smartlist_visibility_all": {
		"id": "smartlist_visibility_all",
		"label": "All",
		"value": "hidden",
		"values": [
		"auto",
		"visible",
		"hidden"
		],
		"tab": "Smart Lists",
		"index": 4
	},
	"smartlist_visibility_assigned_to_me": {
		"id": "smartlist_visibility_assigned_to_me",
		"label": "Assigned to me",
		"value": "visible",
		"values": [
		"auto",
		"visible",
		"hidden"
		],
		"tab": "Smart Lists",
		"index": 0
	},
	"smartlist_visibility_done": {
		"id": "smartlist_visibility_done",
		"label": "Completed",
		"value": "visible",
		"values": [
		"auto",
		"visible",
		"hidden"
		],
		"tab": "Smart Lists",
		"index": 5
	},
	"smartlist_visibility_starred": {
		"id": "smartlist_visibility_starred",
		"label": "Starred",
		"value": "visible",
		"values": [
		"auto",
		"visible",
		"hidden"
		],
		"tab": "Smart Lists",
		"index": 1
	},
	"smartlist_visibility_today": {
		"id": "smartlist_visibility_today",
		"label": "Today",
		"value": "visible",
		"values": [
		"auto",
		"visible",
		"hidden"
		],
		"tab": "Smart Lists",
		"index": 2
	},
	"smartlist_visibility_week": {
		"id": "smartlist_visibility_week",
		"label": "Week",
		"value": "visible",
		"values": [
		"auto",
		"visible",
		"hidden"
		],
		"tab": "Smart Lists",
		"index": 3
	},
	"sound_checkoff_enabled": {
		"id": "sound_checkoff_enabled",
		"label": "Enable sound for checking-off an item",
		"value": true,
		"values": [],
		"tab": "General",
		"index": 4
	},
	"sound_notification_enabled": {
		"id": "sound_notification_enabled",
		"label": "Enable sound for new notifications",
		"value": true,
		"values": [],
		"tab": "General",
		"index": 5
	},
	"start_of_week": {
		"id": "start_of_week",
		"label": "Start of the Week",
		"value": "sun",
		"values": [
		"sun"
		],
		"tab": "General",
		"index": 3
	},
	"time_format": {
		"id": "time_format",
		"label": "Time Format",
		"value": "12 hour",
		"values": [
		"12 hour"
		],
		"tab": "General",
		"index": 2
	},
	"today_smart_list_visible_tasks": {
		"id": "today_smart_list_visible_tasks",
		"label": "Week & Today Settings",
		"value": "all",
		"values": [
		"all"
		],
		"tab": "Smart Lists",
		"index": 6
	},
	"type": {
		"id": "type",
		"label": "",
		"value": "userSettings",
		"values": [
		"userSettings"
		],
		"tab": "",
		"index": 0
	}
};

var KEYCODE_ESC = 27;