var mapping = [
	{
		"selector":".addTask",
		"options":["shortcut_add_new_task"]
	},
	{
		"selector":	".taskItem-star .icon.task-starred, "+
					".taskItem-star .wundercon.starred, "+
					".detail-star .icon.detail-starred, "+
					".detail-star .wundercon.starred",
		"options":["shortcut_mark_task_starred"]
	},
	{
		"selector":	".taskItem-duedate, "+
					".detail-date .token_0",
		"options":["date_format"]
	},
	
	{
		"selector":	".detail-checkbox .checkBox, "+
					".taskItem-checkboxWrapper .checkBox",
		"options":["shortcut_mark_task_done"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='All']",
		"options":["smartlist_visibility_all"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Assigned to me']",
		"options":["smartlist_visibility_assigned_to_me"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Completed']",
		"options":["smartlist_visibility_done"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Starred']",
		"options":["smartlist_visibility_starred"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Today']",
		"options":["smartlist_visibility_today"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Week']",
		"options":["smartlist_visibility_week"]
	},
	{
		"selector":	"#main-toolbar .wundercon.bell-medium, "+
					".detail-reminder .wundercon.reminder",
		"options":["notifications"]
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
		"options":["shortcut_delete"]
	}
];
var options={
	"_locale": ["en"],
	"account_locale": ["en_GB"],
	"add_to_chrome": false,
	"add_to_firefox": false,
	"app_first_used": ["1421913600000"],
	"auto_reminder_noticeperiod": ["0"],
	"auto_reminder_timeinterval": ["540"],
	"background": ["wlbackground15"],
	"behavior_star_tasks_to_top": true,
	"chrome_app_rating_later": ["undefined"],
	"chrome_rating_later": ["undefined"],
	"confirm_delete_entity": true,
	"date_format": ["DD.MM.YYYY"],
	"enable_natural_date_recognition": true,
	"id": ["userSettings"],
	"language": ["en_GB"],
	"last_open_app_date": ["0"],
	"migrated_wunderlist_one_user": true,
	"new_installation": false,
	"new_task_location": ["top"],
	"newsletter_subscription_enabled": false,
	"notifications_desktop_enabled": true,
	"notifications_email_enabled": true,
	"notifications_push_enabled": true,
	"onboarding_add_todo": true,
	"onboarding_click_create_list": true,
	"onboarding_click_share_list": true,
	"print_completed_items": false,
	"pro_trial_limit_assigning": ["3"],
	"pro_trial_limit_comments": ["10"],
	"pro_trial_limit_files": ["3"],
	"shortcut_add_new_list": ["CTRL + L"],
	"shortcut_add_new_task": ["CTRL + 0"],
	"shortcut_copy_tasks": ["CTRL + C"],
	"shortcut_cut_tasks": ["CTRL + X"],
	"shortcut_delete": ["CTRL + BACKSPACE"],
	"shortcut_goto_filter_all": ["CTRL + 5"],
	"shortcut_goto_filter_assigned": ["CTRL + 1"],
	"shortcut_goto_filter_completed": ["CTRL + 6"],
	"shortcut_goto_filter_starred": ["CTRL + 2"],
	"shortcut_goto_filter_today": ["CTRL + 3"],
	"shortcut_goto_filter_week": ["CTRL + 4"],
	"shortcut_goto_inbox": ["CTRL + I"],
	"shortcut_goto_preferences": ["CTRL + P"],
	"shortcut_goto_search": ["CTRL + F"],
	"shortcut_mark_task_done": ["CTRL + D"],
	"shortcut_mark_task_starred": ["CTRL + S"],
	"shortcut_paste_tasks": ["CTRL + V"],
	"shortcut_select_all_tasks": ["CTRL + A"],
	"shortcut_send_via_email": ["CTRL + E"],
	"shortcut_show_notifications": ["CTRL + SHIFT + A"],
	"shortcut_sync": ["R"],
	"show_completed_items": true,
	"significant_event_count": ["0"],
	"smartlist_visibility_all": ["auto","visible","hidden"],
	"smartlist_visibility_assigned_to_me": ["auto","visible","hidden"],
	"smartlist_visibility_done": ["auto","visible","hidden"],
	"smartlist_visibility_starred": ["auto","visible","hidden"],
	"smartlist_visibility_today": ["auto","visible","hidden"],
	"smartlist_visibility_week": ["auto","visible","hidden"],
	"sound_checkoff_enabled": true,
	"sound_notification_enabled": true,
	"start_of_week": ["sun"],
	"time_format": ["12 hour"],
	"today_smart_list_visible_tasks": ["all"],
	"type": ["userSettings"]
};
var KEYCODE_ESC = 27;