define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/cursorColumns"], function (require, exports, assert, utils_1, cursorColumns_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CursorMove', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('nextRenderTabStop', () => {
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(0, 4), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(1, 4), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(2, 4), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(3, 4), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(4, 4), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(5, 4), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(6, 4), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(7, 4), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(8, 4), 12);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(0, 2), 2);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(1, 2), 2);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(2, 2), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(3, 2), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(4, 2), 6);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(5, 2), 6);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(6, 2), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(7, 2), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(8, 2), 10);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(0, 1), 1);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(1, 1), 2);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(2, 1), 3);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(3, 1), 4);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(4, 1), 5);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(5, 1), 6);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(6, 1), 7);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(7, 1), 8);
            assert.strictEqual(cursorColumns_1.CursorColumns.nextRenderTabStop(8, 1), 9);
        });
        test('visibleColumnFromColumn', () => {
            function testVisibleColumnFromColumn(text, tabSize, column, expected) {
                assert.strictEqual(cursorColumns_1.CursorColumns.visibleColumnFromColumn(text, column, tabSize), expected);
            }
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 1, 0);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 2, 4);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 3, 8);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 4, 9);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 5, 10);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 6, 11);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 7, 12);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 8, 13);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 9, 14);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 10, 15);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 11, 16);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 12, 17);
            testVisibleColumnFromColumn('\t\tvar x = 3;', 4, 13, 18);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 1, 0);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 2, 4);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 3, 5);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 4, 8);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 5, 9);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 6, 10);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 7, 11);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 8, 12);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 9, 13);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 10, 14);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 11, 15);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 12, 16);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 13, 17);
            testVisibleColumnFromColumn('\t \tvar x = 3;', 4, 14, 18);
            testVisibleColumnFromColumn('\t  \tx\t', 4, -1, 0);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 0, 0);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 1, 0);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 2, 4);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 3, 5);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 4, 6);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 5, 8);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 6, 9);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 7, 12);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 8, 12);
            testVisibleColumnFromColumn('\t  \tx\t', 4, 9, 12);
            testVisibleColumnFromColumn('baz', 4, 1, 0);
            testVisibleColumnFromColumn('baz', 4, 2, 1);
            testVisibleColumnFromColumn('baz', 4, 3, 2);
            testVisibleColumnFromColumn('baz', 4, 4, 3);
            testVisibleColumnFromColumn('📚az', 4, 1, 0);
            testVisibleColumnFromColumn('📚az', 4, 2, 1);
            testVisibleColumnFromColumn('📚az', 4, 3, 2);
            testVisibleColumnFromColumn('📚az', 4, 4, 3);
            testVisibleColumnFromColumn('📚az', 4, 5, 4);
        });
        test('columnFromVisibleColumn', () => {
            function testColumnFromVisibleColumn(text, tabSize, visibleColumn, expected) {
                assert.strictEqual(cursorColumns_1.CursorColumns.columnFromVisibleColumn(text, visibleColumn, tabSize), expected);
            }
            // testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 0, 1);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 1, 1);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 2, 1);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 3, 2);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 4, 2);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 5, 2);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 6, 2);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 7, 3);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 8, 3);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 9, 4);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 10, 5);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 11, 6);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 12, 7);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 13, 8);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 14, 9);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 15, 10);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 16, 11);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 17, 12);
            testColumnFromVisibleColumn('\t\tvar x = 3;', 4, 18, 13);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 0, 1);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 1, 1);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 2, 1);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 3, 2);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 4, 2);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 5, 3);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 6, 3);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 7, 4);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 8, 4);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 9, 5);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 10, 6);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 11, 7);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 12, 8);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 13, 9);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 14, 10);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 15, 11);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 16, 12);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 17, 13);
            testColumnFromVisibleColumn('\t \tvar x = 3;', 4, 18, 14);
            testColumnFromVisibleColumn('\t  \tx\t', 4, -2, 1);
            testColumnFromVisibleColumn('\t  \tx\t', 4, -1, 1);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 0, 1);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 1, 1);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 2, 1);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 3, 2);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 4, 2);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 5, 3);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 6, 4);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 7, 4);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 8, 5);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 9, 6);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 10, 6);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 11, 7);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 12, 7);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 13, 7);
            testColumnFromVisibleColumn('\t  \tx\t', 4, 14, 7);
            testColumnFromVisibleColumn('baz', 4, 0, 1);
            testColumnFromVisibleColumn('baz', 4, 1, 2);
            testColumnFromVisibleColumn('baz', 4, 2, 3);
            testColumnFromVisibleColumn('baz', 4, 3, 4);
            testColumnFromVisibleColumn('📚az', 4, 0, 1);
            testColumnFromVisibleColumn('📚az', 4, 1, 1);
            testColumnFromVisibleColumn('📚az', 4, 2, 3);
            testColumnFromVisibleColumn('📚az', 4, 3, 4);
            testColumnFromVisibleColumn('📚az', 4, 4, 5);
        });
        test('toStatusbarColumn', () => {
            function t(text, tabSize, column, expected) {
                assert.strictEqual(cursorColumns_1.CursorColumns.toStatusbarColumn(text, column, tabSize), expected, `<<t('${text}', ${tabSize}, ${column}, ${expected})>>`);
            }
            t('    spaces', 4, 1, 1);
            t('    spaces', 4, 2, 2);
            t('    spaces', 4, 3, 3);
            t('    spaces', 4, 4, 4);
            t('    spaces', 4, 5, 5);
            t('    spaces', 4, 6, 6);
            t('    spaces', 4, 7, 7);
            t('    spaces', 4, 8, 8);
            t('    spaces', 4, 9, 9);
            t('    spaces', 4, 10, 10);
            t('    spaces', 4, 11, 11);
            t('\ttab', 4, 1, 1);
            t('\ttab', 4, 2, 5);
            t('\ttab', 4, 3, 6);
            t('\ttab', 4, 4, 7);
            t('\ttab', 4, 5, 8);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 1, 1);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 2, 2);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 3, 2);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 4, 3);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 5, 3);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 6, 4);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 7, 4);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 8, 5);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 9, 5);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 10, 6);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 11, 6);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 12, 7);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 13, 7);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 14, 8);
            t('𐌀𐌁𐌂𐌃𐌄𐌅𐌆', 4, 15, 8);
            t('🎈🎈🎈🎈', 4, 1, 1);
            t('🎈🎈🎈🎈', 4, 2, 2);
            t('🎈🎈🎈🎈', 4, 3, 2);
            t('🎈🎈🎈🎈', 4, 4, 3);
            t('🎈🎈🎈🎈', 4, 5, 3);
            t('🎈🎈🎈🎈', 4, 6, 4);
            t('🎈🎈🎈🎈', 4, 7, 4);
            t('🎈🎈🎈🎈', 4, 8, 5);
            t('🎈🎈🎈🎈', 4, 9, 5);
            t('何何何何', 4, 1, 1);
            t('何何何何', 4, 2, 2);
            t('何何何何', 4, 3, 3);
            t('何何何何', 4, 4, 4);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yTW92ZUhlbHBlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3QvY29tbW9uL2NvbnRyb2xsZXIvY3Vyc29yTW92ZUhlbHBlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLEtBQUssQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO1FBRXhCLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO1lBQzlCLE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRTlELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRTlELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsTUFBTSxDQUFDLFdBQVcsQ0FBQyw2QkFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlELENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtZQUVwQyxTQUFTLDJCQUEyQixDQUFDLElBQVksRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLFFBQWdCO2dCQUNuRyxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM1RixDQUFDO1lBRUQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUV6RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxRCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFMUQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNuRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNuRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVuRCwyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QywyQkFBMkIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUU1QywyQkFBMkIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QywyQkFBMkIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QywyQkFBMkIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QywyQkFBMkIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QywyQkFBMkIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7WUFFcEMsU0FBUywyQkFBMkIsQ0FBQyxJQUFZLEVBQUUsT0FBZSxFQUFFLGFBQXFCLEVBQUUsUUFBZ0I7Z0JBQzFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsNkJBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ25HLENBQUM7WUFFRCwwREFBMEQ7WUFDMUQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekQsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6RCwyQkFBMkIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELDJCQUEyQixDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFekQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6RCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxRCwyQkFBMkIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFELDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDMUQsMkJBQTJCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUUxRCwyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25ELDJCQUEyQixDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFbkQsMkJBQTJCLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsMkJBQTJCLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsMkJBQTJCLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsMkJBQTJCLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFNUMsMkJBQTJCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0MsMkJBQTJCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0MsMkJBQTJCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0MsMkJBQTJCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0MsMkJBQTJCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO1lBRTlCLFNBQVMsQ0FBQyxDQUFDLElBQVksRUFBRSxPQUFlLEVBQUUsTUFBYyxFQUFFLFFBQWdCO2dCQUN6RSxNQUFNLENBQUMsV0FBVyxDQUFDLDZCQUFhLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxJQUFJLE1BQU0sT0FBTyxLQUFLLE1BQU0sS0FBSyxRQUFRLEtBQUssQ0FBQyxDQUFDO1lBQzlJLENBQUM7WUFFRCxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDM0IsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRTNCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFcEIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFOUIsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QixDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QixDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2QixDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFdkIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25CLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuQixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUMifQ==