# -*- coding: utf-8 -*-
"""Entry: python app.py  or  python app.py --gui"""

import sys


def main():
    from gui_app import main as gui_main
    gui_main()


if __name__ == "__main__":
    main()
