var tabs = [{
   "name": "General",
   "hash": "general",
   "count": 0,
   "options": [
      "language",
      "date_format",
      "time_format",
      "start_of_week",
      "sound_checkoff_enabled",
      "sound_notification_enabled",
      "new_task_location",
      "confirm_delete_entity",
      "behavior_star_tasks_to_top",
      "print_completed_items",
      "show_subtask_progress"
   ],
   "partition": [0, 1, 2, 1, 2, 1, 1, 2, 2, 1, 2]
}, {
   "name": "Shortcuts",
   "hash": "shortcuts",
   "count": 0,
   "hasMoreOptions": true,
   "showMoreOptions": false,
   "options": [
      "shortcut_add_new_task",
      "shortcut_add_new_list",
      "shortcut_mark_task_done",
      "shortcut_mark_task_starred",
      "shortcut_select_all_tasks",
      "shortcut_delete",
      "shortcut_copy_tasks",
      "shortcut_paste_tasks",
      "shortcut_goto_search",
      "shortcut_goto_preferences",
      "shortcut_send_via_email",
      "shortcut_show_notifications",
      "shortcut_goto_inbox",
      "shortcut_goto_filter_assigned",
      "shortcut_goto_filter_starred",
      "shortcut_goto_filter_today",
      "shortcut_goto_filter_week",
      "shortcut_goto_filter_all",
      "shortcut_goto_filter_completed",
      "shortcut_sync"
   ],
   "partition": [1, 2, 2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]
}, {
   "name": "Smart Lists",
   "hash": "sidebar",
   "count": 0,
   "options": [
      "smartlist_visibility_assigned_to_me",
      "smartlist_visibility_starred",
      "smartlist_visibility_today",
      "smartlist_visibility_week",
      "smartlist_visibility_all",
      "smartlist_visibility_done",
      "today_smart_list_visible_tasks"
   ],
   "partition": [2, 0, 1, 2, 1, 2, 1]
}, {
   "name": "Notifications",
   "hash": "notifications",
   "description": "<strong>Notify me of important events via:</strong> <br> Stay in sync and get notified when items are added or completed in your shared lists. You can choose which lists you get notifications about, in each list's edit dialog.",
   "count": 0,
   "options": [
      "notifications_email_enabled",
      "notifications_push_enabled",
      "notifications_desktop_enabled"
   ],
   "partition": [1, 2, 12]
}]

// compute the numbers of 1 and 2 in each tab
console.log();
var total = 0;
tabs.forEach(function(tab) {
   var count1 = 0;
   var count2 = 0;
   for (var i = 0; i < tab.options.length; i++) {
      switch (tab.partition[i]) {
         case 1:
            count1++;
            break;
         case 2:
            count2++;
            break;
         case 12:
            count1++;
            count2++;
            break;
         case 0:
            break;
      }
   }
   console.log(tab.name, "has partitions of size", count1, count2);
   total += count1 + count1;
});
console.log("total number of options:", total)
console.log()

// compute the sum of indices for each partition in each tab
console.log();
var total1 = 0;
var total2 = 0;
tabs.forEach(function(tab) {
   var sum1 = 0;
   var sum2 = 0;
   for (var i = 0; i < tab.options.length; i++) {
      switch (tab.partition[i]) {
         case 1:
            sum1 += i;
            break;
         case 2:
            sum2 += i;
            break;
         case 12:
            sum1 += i;
            sum2 += i;
            break;
         case 0:
            break;
      }
   }
   console.log(tab.name, "sum of indices in each partition is", sum1, sum2);
   total1 += sum1;
   total2 += sum2;
});
console.log("sum of indices in each partition is", total1, total2)
console.log()

// prepare the two partitions
part1 = {
   "General": [],
   "Shortcuts": [],
   "Smart Lists": [],
   "Notifications": []
}
part2 = {
   "General": [],
   "Shortcuts": [],
   "Smart Lists": [],
   "Notifications": []
}

// print the two partitions as a list of option_IDs
console.log()
tabs.forEach(function(tab) {
   for (var i = 0; i < tab.options.length; i++) {
      switch (tab.partition[i]) {
         case 1:
            part1[tab.name].push(tab.options[i]);
            break;
         case 2:
            part2[tab.name].push(tab.options[i]);
            break;
         case 12:
            part1[tab.name].push(tab.options[i]);
            part2[tab.name].push(tab.options[i]);
            break;
         case 0:
            break;
      }
   }
});
console.log(part1)
console.log()
console.log(part2)
